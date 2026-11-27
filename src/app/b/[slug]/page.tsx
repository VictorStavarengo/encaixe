import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { Badge } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/slots";
import {
  formatDuration,
  formatPrice,
  formatTime,
  upcomingDays,
} from "@/lib/time";

type PageSearchParams = {
  service?: string | string[];
  date?: string | string[];
};

export async function generateMetadata(
  props: PageProps<"/b/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const business = await prisma.business.findUnique({
      where: { slug },
      select: { name: true, address: true },
    });

    if (!business) return { title: "Página não encontrada" };

    return {
      title: `${business.name} · agendamento`,
      description: `Escolha um horário e marque seu atendimento em ${business.name}${
        business.address ? ` — ${business.address}` : ""
      }.`,
    };
  } catch {
    // Metadado é best-effort: se o banco cair, o error boundary da página mostra o aviso.
    return { title: "Agendamento indisponível" };
  }
}

export default function BookingPage(props: PageProps<"/b/[slug]">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingContent
        params={props.params}
        searchParams={props.searchParams as Promise<PageSearchParams>}
      />
    </Suspense>
  );
}

async function BookingContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: {
        where: { active: true },
        orderBy: [{ position: "asc" }, { name: "asc" }],
      },
      hours: { select: { weekday: true } },
    },
  });

  if (!business) notFound();

  const serviceId = first(query.service);
  const selectedService =
    business.services.find((service) => service.id === serviceId) ??
    business.services[0];

  const days = upcomingDays(business.timezone);
  const requestedDate = first(query.date);
  const openWeekdays = new Set(business.hours.map((entry) => entry.weekday));
  const firstOpenDay =
    days.find((day) => openWeekdays.has(new Date(`${day.iso}T12:00:00Z`).getUTCDay())) ??
    days[0];
  const selectedDate =
    days.find((day) => day.iso === requestedDate)?.iso ?? firstOpenDay.iso;
  const nextOpenDay = days.find(
    (day) =>
      day.iso > selectedDate &&
      openWeekdays.has(new Date(`${day.iso}T12:00:00Z`).getUTCDay()),
  );

  const slots = selectedService
    ? await getAvailableSlots({
        businessId: business.id,
        timezone: business.timezone,
        dateIso: selectedDate,
        durationMin: selectedService.durationMin,
      })
    : [];

  const selectedDay = days.find((day) => day.iso === selectedDate) ?? days[0];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-start gap-4 px-5 py-8">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy font-display text-lg font-bold uppercase text-white shadow-[0_6px_16px_-8px_rgba(10,42,86,0.65)]">
            {initials(business.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy">
              agende seu horário
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {business.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
              {business.address ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {business.address}
                </span>
              ) : null}
              {business.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5.5 4h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4Z" />
                  </svg>
                  {business.phone}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        {business.services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-card px-6 py-14 text-center">
            <p className="text-sm font-medium">Agenda em configuração</p>
            <p className="mt-1 text-sm text-muted">
              Este negócio ainda não publicou serviços. Volte em breve.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <SectionHeader step="1" title="Escolha o serviço" />
              <div className="grid gap-2 sm:grid-cols-2">
                {business.services.map((service) => {
                  const active = service.id === selectedService?.id;

                  return (
                    <Link
                      key={service.id}
                      href={`/b/${slug}?service=${service.id}&date=${selectedDate}`}
                      scroll={false}
                      className={
                        active
                          ? "flex items-center justify-between gap-3 rounded-xl border border-navy bg-navy-soft px-4 py-3 ring-1 ring-navy/10 transition-shadow duration-150 hover:shadow-[0_10px_22px_-18px_rgba(10,42,86,0.45)]"
                          : "flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-[0_12px_24px_-20px_rgba(11,17,32,0.5)]"
                      }
                    >
                      <div>
                        <p className="text-sm font-semibold">{service.name}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {formatDuration(service.durationMin)}
                        </p>
                      </div>
                      <span className="flex items-center gap-2">
                        <span
                          className={
                            active
                              ? "text-sm font-bold text-navy-deep"
                              : "text-sm font-semibold text-ink"
                          }
                        >
                          {service.priceCents === 0
                            ? "Grátis"
                            : formatPrice(service.priceCents)}
                        </span>
                        {active ? (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-navy" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
                            <path d="m8.5 12.2 2.3 2.3 4.7-4.9" />
                          </svg>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionHeader step="2" title="Escolha o dia" />
              <div className="hide-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]">
                {days.map((day) => {
                  const active = day.iso === selectedDate;

                  return (
                    <Link
                      key={day.iso}
                      href={`/b/${slug}?service=${selectedService?.id}&date=${day.iso}`}
                      scroll={false}
                      aria-current={active ? "date" : undefined}
                      className={
                        active
                          ? "min-w-16 snap-start rounded-xl border border-navy bg-navy px-3 py-2 text-center text-white shadow-[0_6px_14px_-8px_rgba(10,42,86,0.6)] transition-colors duration-150 hover:border-navy-deep hover:bg-navy-deep"
                          : "min-w-16 snap-start rounded-xl border border-line bg-card px-3 py-2 text-center text-ink-soft transition-[border-color,color,background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-navy/40 hover:bg-navy-soft/60 hover:text-ink hover:shadow-[0_10px_20px_-18px_rgba(11,17,32,0.5)]"
                      }
                    >
                      <span className="block text-[11px] uppercase tracking-wide opacity-80">
                        {day.isToday ? "hoje" : day.weekday}
                      </span>
                      <span className="block text-base font-semibold">
                        {day.day}
                      </span>
                      <span className="block text-[10px] uppercase opacity-70">
                        {day.month}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionHeader
                step="3"
                title="Escolha o horário"
                aside={
                  <span className="text-xs font-medium text-ink-soft">
                    {selectedDay.weekday}, {selectedDay.day}/{selectedDay.month}
                  </span>
                }
              />

              {selectedService ? (
                <BookingForm
                  slug={slug}
                  serviceId={selectedService.id}
                  serviceName={selectedService.name}
                  serviceMeta={`${formatDuration(selectedService.durationMin)} · ${
                    selectedService.priceCents === 0
                      ? "Grátis"
                      : formatPrice(selectedService.priceCents)
                  }`}
                  dateLabel={`${selectedDay.weekday}, ${selectedDay.day}/${selectedDay.month}`}
                  nextDay={
                    nextOpenDay
                      ? {
                          href: `/b/${slug}?service=${selectedService.id}&date=${nextOpenDay.iso}`,
                          label: `${nextOpenDay.weekday}, ${nextOpenDay.day}/${nextOpenDay.month}`,
                        }
                      : null
                  }
                  slots={slots.map((slot) => ({
                    startsAt: slot.startsAt.toISOString(),
                    label: formatTime(slot.startsAt, business.timezone),
                    endsAt: formatTime(slot.endsAt, business.timezone),
                  }))}
                />
              ) : null}
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            agenda criada com <span className="font-medium text-ink">encaixe</span>
          </Link>
          <span>
            Horário de referência: {business.timezone.replace("_", " ")}
          </span>
        </div>
      </footer>
    </div>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function SectionHeader({
  step,
  title,
  aside,
}: {
  step: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy font-display text-[11px] font-bold text-white">
          {step}
        </span>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function BookingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16">
      <div className="mb-8 h-8 w-2/3 animate-pulse rounded-lg bg-paper-deep" />
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-paper-deep"
          />
        ))}
      </div>
      <Badge tone="sand">carregando horários…</Badge>
    </div>
  );
}
