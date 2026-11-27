import { addDays } from "date-fns";

export const MIN_BOOKING_LEAD_MINUTES = 30;
export const SLOT_STEP_MINUTES = 30;
export const DAYS_AHEAD = 14;

const WEEKDAYS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

export function isoDateInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function weekdayOfIsoDate(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function addDaysToIso(iso: string, days: number): string {
  return addDays(new Date(`${iso}T12:00:00Z`), days)
    .toISOString()
    .slice(0, 10);
}

export type DayOption = {
  iso: string;
  weekday: string;
  day: string;
  month: string;
  isToday: boolean;
};

export function upcomingDays(timeZone: string, count = DAYS_AHEAD): DayOption[] {
  const todayIso = isoDateInTz(new Date(), timeZone);
  const shortWeekday = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    timeZone: "UTC",
  });
  const dayFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    timeZone: "UTC",
  });
  const monthFmt = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "UTC",
  });

  return Array.from({ length: count }, (_, index) => {
    const iso = addDaysToIso(todayIso, index);
    const date = new Date(`${iso}T12:00:00Z`);

    return {
      iso,
      weekday: shortWeekday.format(date).replace(".", ""),
      day: dayFmt.format(date),
      month: monthFmt.format(date).replace(".", ""),
      isToday: index === 0,
    };
  });
}

export function weekdayName(weekday: number): string {
  return WEEKDAYS[weekday] ?? "";
}

export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDateShort(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(/\./g, "");
}

export function formatDateTimeLong(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}

export function isoToTimeInput(value: string): string {
  return value.slice(0, 5);
}
