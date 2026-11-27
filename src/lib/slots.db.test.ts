import { randomUUID } from "node:crypto";
import { fromZonedTime } from "date-fns-tz";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { getAvailableSlots, isSlotStillAvailable } from "./slots";

const TZ = "America/Sao_Paulo";
const FRIDAY = "2026-12-04";
// 08:00 em São Paulo — antes da abertura, longe da antecedência mínima.
const MORNING = new Date("2026-12-04T11:00:00Z");

const hasDatabase = Boolean(process.env.DATABASE_URL);

type Fixture = {
  userId: string;
  businessId: string;
  serviceId: string;
};

let fixture: Fixture;

describe.runIf(hasDatabase)("agenda com Postgres", () => {
  beforeAll(async () => {
    // Apenas o relógio é falsificado: getAvailableSlots usa Date.now() para a
    // antecedência mínima, mas os timers reais continuam disponíveis para o driver do Postgres.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(MORNING);

    const suffix = randomUUID();
    const user = await prisma.user.create({
      data: {
        email: `fixture-slots-${suffix}@example.test`,
        name: "Fixture Slots",
      },
    });

    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: "Fixture Slots",
        slug: `fixture-slots-${suffix}`,
        timezone: TZ,
        hours: {
          create: [{ weekday: 5, opensAt: "09:00", closesAt: "12:00" }],
        },
      },
    });

    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name: "Corte",
        durationMin: 60,
        priceCents: 5000,
      },
    });

    fixture = {
      userId: user.id,
      businessId: business.id,
      serviceId: service.id,
    };
  });

  afterAll(async () => {
    vi.useRealTimers();
    if (!fixture) return;

    await prisma.booking.deleteMany({ where: { businessId: fixture.businessId } });
    await prisma.business.delete({ where: { id: fixture.businessId } });
    await prisma.user.delete({ where: { id: fixture.userId } });
  });

  beforeEach(async () => {
    vi.setSystemTime(MORNING);
    await prisma.booking.deleteMany({ where: { businessId: fixture.businessId } });
  });

  async function book(startsAt: string, minutes = 60, status: "PENDING" | "CONFIRMED" | "CANCELLED" = "PENDING") {
    const start = fromZonedTime(`${FRIDAY}T${startsAt}:00`, TZ);
    return prisma.booking.create({
      data: {
        businessId: fixture.businessId,
        serviceId: fixture.serviceId,
        serviceName: "Corte",
        customerName: "Cliente Teste",
        customerEmail: "cliente@example.test",
        startsAt: start,
        endsAt: new Date(start.getTime() + minutes * 60_000),
        status,
        cancelToken: randomUUID(),
      },
    });
  }

  function slotLabels(slots: Awaited<ReturnType<typeof getAvailableSlots>>) {
    return slots.map((slot) =>
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(slot.startsAt),
    );
  }

  it("gera slots a cada 30 min respeitando o expediente e a duração", async () => {
    const slots = await getAvailableSlots({
      businessId: fixture.businessId,
      timezone: TZ,
      dateIso: FRIDAY,
      durationMin: 60,
    });

    expect(slotLabels(slots)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
    expect(slots[0].startsAt.toISOString()).toBe("2026-12-04T12:00:00.000Z");
    expect(slots.at(-1)?.endsAt.toISOString()).toBe("2026-12-04T15:00:00.000Z");
  });

  it("corta os slots quando a duração não cabe até o fechamento", async () => {
    const slots = await getAvailableSlots({
      businessId: fixture.businessId,
      timezone: TZ,
      dateIso: FRIDAY,
      durationMin: 120,
    });

    expect(slotLabels(slots)).toEqual(["09:00", "09:30", "10:00"]);
  });

  it("devolve vazio em dia sem expediente", async () => {
    const slots = await getAvailableSlots({
      businessId: fixture.businessId,
      timezone: TZ,
      dateIso: "2026-12-05",
      durationMin: 60,
    });

    expect(slots).toEqual([]);
  });

  it("remove os slots que colidem com agendamento ativo", async () => {
    await book("10:00");

    const slots = await getAvailableSlots({
      businessId: fixture.businessId,
      timezone: TZ,
      dateIso: FRIDAY,
      durationMin: 60,
    });

    expect(slotLabels(slots)).toEqual(["09:00", "11:00"]);
  });

  it("não bloqueia o horário quando o agendamento foi cancelado", async () => {
    await book("10:00", 60, "CANCELLED");

    const slots = await getAvailableSlots({
      businessId: fixture.businessId,
      timezone: TZ,
      dateIso: FRIDAY,
      durationMin: 60,
    });

    expect(slotLabels(slots)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
  });

  it("aplica a antecedência mínima de 30 min", async () => {
    vi.setSystemTime(new Date("2026-12-04T12:10:00Z")); // 09:10 em São Paulo

    const slots = await getAvailableSlots({
      businessId: fixture.businessId,
      timezone: TZ,
      dateIso: FRIDAY,
      durationMin: 60,
    });

    expect(slotLabels(slots)).toEqual(["10:00", "10:30", "11:00"]);
  });

  it("isSlotStillAvailable confere o início exato, não só o dia", async () => {
    const free = fromZonedTime(`${FRIDAY}T10:00:00`, TZ);
    const misaligned = fromZonedTime(`${FRIDAY}T10:15:00`, TZ);

    expect(
      await isSlotStillAvailable({
        businessId: fixture.businessId,
        timezone: TZ,
        durationMin: 60,
        startsAt: free,
      }),
    ).toBe(true);

    await book("10:00");

    expect(
      await isSlotStillAvailable({
        businessId: fixture.businessId,
        timezone: TZ,
        durationMin: 60,
        startsAt: free,
      }),
    ).toBe(false);

    expect(
      await isSlotStillAvailable({
        businessId: fixture.businessId,
        timezone: TZ,
        durationMin: 60,
        startsAt: misaligned,
      }),
    ).toBe(false);
  });

  it("impede dois agendamentos ativos no mesmo horário e libera após o cancelamento", async () => {
    const first = await book("09:00");

    await expect(book("09:00", 60, "CONFIRMED")).rejects.toMatchObject({
      code: "P2002",
    });

    await prisma.booking.update({
      where: { id: first.id },
      data: { status: "CANCELLED" },
    });

    const second = await book("09:00", 60, "CONFIRMED");
    expect(second.status).toBe("CONFIRMED");
  });
});
