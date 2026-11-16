import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { fromZonedTime } from "date-fns-tz";
import { CopyLink } from "@/components/copy-link";
import { StatusBadge } from "@/components/status-badge";
import { Card, EmptyState, PageTitle } from "@/components/ui";
import { requireBusiness } from "@/lib/business";
import { appUrl } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  addDaysToIso,
  formatDateTimeLong,
  formatPrice,
  isoDateInTz,
} from "@/lib/time";

export default function DashboardPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const business = await requireBusiness();
  const now = new Date();
  const tz = business.timezone;

  const todayIso = isoDateInTz(now, tz);
  const startOfToday = fromZonedTime(`${todayIso}T00:00:00`, tz);
  const endOfToday = fromZonedTime(`${todayIso}T23:59:59`, tz);
  const endOfWeek = fromZonedTime(`${addDaysToIso(todayIso, 7)}T00:00:00`, tz);

  const [todayCount, pendings, weekCount, upcoming, revenue] = await Promise.all([
    prisma.booking.count({
      where: {
        businessId: business.id,
        status: { not: "CANCELLED" },
        startsAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
    prisma.booking.count({
      where: {
        businessId: business.id,
        status: "PENDING",
        startsAt: { gte: now },
      },
    }),
    prisma.booking.count({
      where: {
        businessId: business.id,
        status: { not: "CANCELLED" },
        startsAt: { gte: now, lt: endOfWeek },
      },
    }),
    prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: { not: "CANCELLED" },
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    prisma.booking.aggregate({
      _sum: { servicePriceCents: true },
      where: {
        businessId: business.id,
        status: { not: "CANCELLED" },
        startsAt: { gte: startOfToday, lt: endOfWeek },
      },
    }),
  ]);

  const publicUrl = `${appUrl()}/b/${business.slug}`;
  const weekRevenue = revenue._sum.servicePriceCents ?? 0;

  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="visão geral"
        title={`Olá, ${business.name}`}
        description="Acompanhe o movimento da semana e mantenha sua página pronta para receber agendamentos."
      />

      <Card className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden bg-navy-deep text-white">
        <div
          className="pointer-events-none absolute -top-20 right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden />
            sua página pública
          </p>
          <p className="mt-1 font-mono text-sm text-white/90">{publicUrl}</p>
        </div>
        <div className="relative flex items-center gap-2">
          <CopyLink url={publicUrl} />
          <Link
            href={`/b/${business.slug}`}
            className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Abrir
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Hoje"
          value={todayCount}
          hint="agendamentos ativos"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
              <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3M9 14.5l2 2 4-4" />
            </svg>
          }
        />
        <Stat
          label="Aguardando"
          value={pendings}
          hint="pedidos para confirmar"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 3.5h10M7 20.5h10M8 3.5v3.2c0 1.7 1.2 2.6 2.4 3.3L12 11l1.6-1c1.2-.7 2.4-1.6 2.4-3.3V3.5M8 20.5v-3.2c0-1.7 1.2-2.6 2.4-3.3L12 13l1.6 1c1.2.7 2.4 1.6 2.4 3.3v3.2" />
            </svg>
          }
        />
        <Stat
          label="Próximos 7 dias"
          value={weekCount}
          hint="na fila"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
              <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3M8 13.5h3M8 17h6" />
            </svg>
          }
        />
        <Stat
          label="Receita prevista"
          value={formatPrice(weekRevenue)}
          hint="semana atual"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2.5" y="6.5" width="19" height="11" rx="2.5" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M6 9.5v5M18 9.5v5" />
            </svg>
          }
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-ink-soft">
            Próximos atendimentos
          </h2>
          <Link
            href="/dashboard/agendamentos"
            className="group inline-flex items-center gap-1 text-sm text-navy hover:underline"
          >
            Ver todos
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="Nenhum agendamento futuro"
            description="Compartilhe o link da sua página para começar a receber pedidos."
            action={
              <Link
                href="/dashboard/pagina"
                className="text-sm font-medium text-navy hover:underline"
              >
                Personalizar página
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
            {upcoming.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-paper/60"
              >
                <div>
                  <p className="text-sm font-medium">{booking.customerName}</p>
                  <p className="text-xs text-ink-soft">
                    {booking.serviceName} ·{" "}
                    {formatDateTimeLong(booking.startsAt, tz)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink-soft">
                    {booking.servicePriceCents === 0
                      ? "Grátis"
                      : formatPrice(booking.servicePriceCents)}
                  </span>
                  <StatusBadge status={booking.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-soft text-navy">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-1/2 animate-pulse rounded-lg bg-paper-deep" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-paper-deep"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-paper-deep" />
    </div>
  );
}
