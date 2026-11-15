import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import {
  MIN_BOOKING_LEAD_MINUTES,
  SLOT_STEP_MINUTES,
  weekdayOfIsoDate,
} from "@/lib/time";

export type Slot = {
  startsAt: Date;
  endsAt: Date;
};

export async function getAvailableSlots(params: {
  businessId: string;
  timezone: string;
  dateIso: string;
  durationMin: number;
}): Promise<Slot[]> {
  const { businessId, timezone, dateIso, durationMin } = params;

  const hours = await prisma.openingHours.findUnique({
    where: {
      businessId_weekday: {
        businessId,
        weekday: weekdayOfIsoDate(dateIso),
      },
    },
  });

  if (!hours) return [];

  const opensAt = fromZonedTime(`${dateIso}T${hours.opensAt}:00`, timezone);
  const closesAt = fromZonedTime(`${dateIso}T${hours.closesAt}:00`, timezone);

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      startsAt: { lt: closesAt },
      endsAt: { gt: opensAt },
    },
    select: { startsAt: true, endsAt: true },
  });

  const earliest = Date.now() + MIN_BOOKING_LEAD_MINUTES * 60_000;
  const slots: Slot[] = [];

  for (
    let start = opensAt;
    addMinutes(start, durationMin) <= closesAt;
    start = addMinutes(start, SLOT_STEP_MINUTES)
  ) {
    const end = addMinutes(start, durationMin);

    if (start.getTime() < earliest) continue;

    const overlaps = bookings.some(
      (booking) => start < booking.endsAt && end > booking.startsAt,
    );
    if (overlaps) continue;

    slots.push({ startsAt: start, endsAt: end });
  }

  return slots;
}

export async function isSlotStillAvailable(params: {
  businessId: string;
  timezone: string;
  durationMin: number;
  startsAt: Date;
}): Promise<boolean> {
  const { businessId, timezone, durationMin, startsAt } = params;
  const dateIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(startsAt);

  const slots = await getAvailableSlots({
    businessId,
    timezone,
    dateIso,
    durationMin,
  });

  return slots.some(
    (slot) => slot.startsAt.getTime() === startsAt.getTime(),
  );
}
