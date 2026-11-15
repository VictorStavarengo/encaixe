"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { signOut } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<string, string>>;
} | null;

function refreshDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agendamentos");
  revalidatePath("/dashboard/servicos");
  revalidatePath("/dashboard/horarios");
  revalidatePath("/dashboard/pagina");
}

function firstErrors(error: z.ZodError): Record<string, string> {
  const { fieldErrors } = z.flattenError(error);
  const result: Record<string, string> = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      result[key] = String(messages[0]);
    }
  }

  return result;
}

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// ---------- Negócio ----------

const businessSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do negócio").max(60),
  slug: z
    .string()
    .trim()
    .min(3, "Use pelo menos 3 caracteres")
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen"),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(120),
  timezone: z.string().trim().refine(isValidTimezone, "Fuso horário inválido"),
});

export async function saveBusinessAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const business = await requireBusiness();

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error) };

  try {
    await prisma.business.update({
      where: { id: business.id },
      data: parsed.data,
    });
  } catch (cause) {
    if (
      cause instanceof Prisma.PrismaClientKnownRequestError &&
      cause.code === "P2002"
    ) {
      return { fieldErrors: { slug: "Este link já está em uso" } };
    }
    throw cause;
  }

  refreshDashboard();
  revalidatePath(`/b/${parsed.data.slug}`);

  return { success: "Página atualizada." };
}

// ---------- Serviços ----------

function parsePriceToCents(value: string): number | null {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");

  if (!normalized) return 0;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return Math.round(parsed * 100);
}

const serviceFieldsSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do serviço").max(60),
  durationMin: z.coerce
    .number()
    .int()
    .min(5, "Mínimo de 5 minutos")
    .max(480, "Máximo de 8 horas"),
  price: z.string(),
});

export async function createServiceAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const business = await requireBusiness();

  const parsed = serviceFieldsSchema.safeParse({
    name: formData.get("name"),
    durationMin: formData.get("durationMin"),
    price: formData.get("price") ?? "",
  });

  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error) };

  const priceCents = parsePriceToCents(parsed.data.price);
  if (priceCents === null) return { fieldErrors: { price: "Valor inválido" } };

  const count = await prisma.service.count({
    where: { businessId: business.id },
  });

  await prisma.service.create({
    data: {
      businessId: business.id,
      name: parsed.data.name,
      durationMin: parsed.data.durationMin,
      priceCents,
      position: count,
    },
  });

  refreshDashboard();
  revalidatePath(`/b/${business.slug}`);

  return { success: "Serviço criado." };
}

export async function updateServiceAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const business = await requireBusiness();
  const id = String(formData.get("id") ?? "");

  const parsed = serviceFieldsSchema.safeParse({
    name: formData.get("name"),
    durationMin: formData.get("durationMin"),
    price: formData.get("price") ?? "",
  });

  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error) };

  const priceCents = parsePriceToCents(parsed.data.price);
  if (priceCents === null) return { fieldErrors: { price: "Valor inválido" } };

  const { count } = await prisma.service.updateMany({
    where: { id, businessId: business.id },
    data: {
      name: parsed.data.name,
      durationMin: parsed.data.durationMin,
      priceCents,
    },
  });

  if (count === 0) return { error: "Serviço não encontrado." };

  refreshDashboard();
  revalidatePath(`/b/${business.slug}`);

  return { success: "Serviço atualizado." };
}

export async function toggleServiceAction(formData: FormData) {
  const business = await requireBusiness();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "1";

  await prisma.service.updateMany({
    where: { id, businessId: business.id },
    data: { active },
  });

  refreshDashboard();
  revalidatePath(`/b/${business.slug}`);
}

export async function deleteServiceAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const business = await requireBusiness();
  const id = String(formData.get("id") ?? "");

  const service = await prisma.service.findFirst({
    where: { id, businessId: business.id },
    select: { id: true },
  });

  if (!service) return { error: "Serviço não encontrado." };

  const upcoming = await prisma.booking.count({
    where: {
      serviceId: id,
      status: { not: "CANCELLED" },
      startsAt: { gte: new Date() },
    },
  });

  if (upcoming > 0) {
    return {
      error:
        "Este serviço tem agendamentos futuros. Desative-o em vez de excluir.",
    };
  }

  await prisma.service.delete({ where: { id } });

  refreshDashboard();
  revalidatePath(`/b/${business.slug}`);

  return { success: "Serviço excluído." };
}

// ---------- Horários ----------

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function saveHoursAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const business = await requireBusiness();

  const entries: Array<{
    weekday: number;
    closed: boolean;
    opensAt: string;
    closesAt: string;
  }> = [];

  for (let weekday = 0; weekday < 7; weekday += 1) {
    const closed = formData.get(`closed-${weekday}`) === "on";
    const opensAt = String(formData.get(`open-${weekday}`) ?? "");
    const closesAt = String(formData.get(`close-${weekday}`) ?? "");

    if (closed) {
      entries.push({ weekday, closed: true, opensAt: "", closesAt: "" });
      continue;
    }

    if (!timePattern.test(opensAt) || !timePattern.test(closesAt)) {
      return { error: "Preencha abertura e fechamento com horários válidos." };
    }

    if (opensAt >= closesAt) {
      return {
        error: "O horário de abertura precisa ser antes do fechamento.",
      };
    }

    entries.push({ weekday, closed: false, opensAt, closesAt });
  }

  await prisma.$transaction(
    entries.map((entry) =>
      entry.closed
        ? prisma.openingHours.deleteMany({
            where: { businessId: business.id, weekday: entry.weekday },
          })
        : prisma.openingHours.upsert({
            where: {
              businessId_weekday: {
                businessId: business.id,
                weekday: entry.weekday,
              },
            },
            create: {
              businessId: business.id,
              weekday: entry.weekday,
              opensAt: entry.opensAt,
              closesAt: entry.closesAt,
            },
            update: {
              opensAt: entry.opensAt,
              closesAt: entry.closesAt,
            },
          }),
    ),
  );

  refreshDashboard();
  revalidatePath(`/b/${business.slug}`);

  return { success: "Horários salvos." };
}

// ---------- Agendamentos ----------

export async function setBookingStatusAction(formData: FormData) {
  const business = await requireBusiness();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) return;

  await prisma.booking.updateMany({
    where: { id, businessId: business.id },
    data: { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" },
  });

  refreshDashboard();
  revalidatePath(`/b/${business.slug}`);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
