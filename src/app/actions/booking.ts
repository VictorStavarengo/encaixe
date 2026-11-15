"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { isSlotStillAvailable } from "@/lib/slots";

export type BookingFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
} | null;

const bookingSchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.string().min(1),
  customerName: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo")
    .max(80, "Nome muito longo"),
  customerEmail: z.email("Informe um e-mail válido"),
  customerPhone: z.string().trim().max(30, "Telefone muito longo"),
  notes: z.string().trim().max(300, "Máximo de 300 caracteres"),
});

const SLOT_TAKEN =
  "Esse horário acabou de ser reservado por outra pessoa. Escolha outro.";

class SlotTakenError extends Error {}

export async function createBookingAction(
  _previous: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    serviceId: formData.get("serviceId"),
    startsAt: formData.get("startsAt"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([key, messages]) => [
          key,
          messages?.[0] ?? "",
        ]),
      ),
    };
  }

  const data = parsed.data;
  const startsAt = new Date(data.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Horário inválido. Escolha outro." };
  }

  const business = await prisma.business.findUnique({
    where: { slug: data.slug },
    include: { services: true },
  });

  if (!business) return { error: "Página de agendamento não encontrada." };

  const service = business.services.find(
    (item) => item.id === data.serviceId && item.active,
  );

  if (!service) return { error: "Serviço indisponível. Escolha outro." };

  const available = await isSlotStillAvailable({
    businessId: business.id,
    timezone: business.timezone,
    durationMin: service.durationMin,
    startsAt,
  });

  if (!available) return { error: SLOT_TAKEN };

  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);
  const cancelToken = randomUUID();

  let bookingId: string | null = null;

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.booking.findFirst({
          where: {
            businessId: business.id,
            status: { not: "CANCELLED" },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        });

        if (conflict) throw new SlotTakenError();

        return tx.booking.create({
          data: {
            businessId: business.id,
            serviceId: service.id,
            serviceName: service.name,
            servicePriceCents: service.priceCents,
            customerName: data.customerName,
            customerEmail: data.customerEmail.toLowerCase(),
            customerPhone: data.customerPhone || null,
            notes: data.notes || null,
            startsAt,
            endsAt,
            cancelToken,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );

    bookingId = booking.id;
  } catch (cause) {
    if (cause instanceof SlotTakenError) return { error: SLOT_TAKEN };
    if (
      cause instanceof Prisma.PrismaClientKnownRequestError &&
      (cause.code === "P2002" || cause.code === "P2034")
    ) {
      return { error: SLOT_TAKEN };
    }
    throw cause;
  }

  if (!bookingId) return { error: SLOT_TAKEN };

  await sendBookingConfirmationEmail(bookingId);

  revalidatePath(`/b/${business.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agendamentos");

  redirect(`/b/${business.slug}/confirmado/${cancelToken}`);
}

export async function cancelBookingByTokenAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!token) return;

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: { business: true },
  });

  if (!booking) return;

  if (booking.status !== "CANCELLED") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
  }

  revalidatePath(`/b/${booking.business.slug}`);
  revalidatePath(`/b/${booking.business.slug}/confirmado/${token}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agendamentos");

  redirect(`/b/${booking.business.slug}/confirmado/${token}`);
}
