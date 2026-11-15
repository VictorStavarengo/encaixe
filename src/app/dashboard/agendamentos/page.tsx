import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { setBookingStatusAction } from "@/app/actions/dashboard";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, PageTitle } from "@/components/ui";
import { requireBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatPrice, formatTime } from "@/lib/time";

export default function BookingsPage(props: PageProps<"/dashboard/agendamentos">) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <BookingsContent
        searchParams={props.searchParams as Promise<{ filtro?: string | string[] }>}
      />
    </Suspense>
  );
}

async function BookingsContent({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string | string[] }>;
}) {
  const business = await requireBusiness();
  const query = await searchParams;
  const rawFilter = Array.isArray(query.filtro) ? query.filtro[0] : query.filtro;
  const filter = rawFilter === "historico" ? "historico" : "proximos";
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
      startsAt:
        filter === "proximos" ? { gte: now } : { lt: now },
      ...(filter === "historico" ? {} : { status: { not: "CANCELLED" } }),
    },
    orderBy: { startsAt: filter === "proximos" ? "asc" : "desc" },
    take: 60,
  });

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="agendamentos"
        title="Quem passa por aqui"
        description="Confirme os pedidos pendentes e acompanhe o histórico do seu atendimento."
      />

      <div className="flex gap-2">
        <FilterLink href="/dashboard/agendamentos" active={filter === "proximos"}>
          Próximos
        </FilterLink>
        <FilterLink
          href="/dashboard/agendamentos?filtro=historico"
          active={filter === "historico"}
        >
          Histórico
        </FilterLink>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title={
            filter === "proximos"
              ? "Nenhum agendamento futuro"
              : "Nada no histórico ainda"
          }
          description={
            filter === "proximos"
              ? "Quando alguém marcar pela sua página, o pedido aparece aqui."
              : "Atendimentos que já passaram ficam salvos nesta aba."
          }
        />
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{booking.customerName}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {booking.serviceName} ·{" "}
                    {formatPrice(booking.servicePriceCents)} ·{" "}
                    {Math.round(
                      (booking.endsAt.getTime() - booking.startsAt.getTime()) /
                        60_000,
                    )}{" "}
                    min
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateShort(booking.startsAt, business.timezone)} ·{" "}
                    {formatTime(booking.startsAt, business.timezone)} —{" "}
                    {formatTime(booking.endsAt, business.timezone)}
                  </p>
                  <p className="mt-2 text-xs text-ink-soft">
                    {booking.customerEmail}
                    {booking.customerPhone ? ` · ${booking.customerPhone}` : ""}
                  </p>
                  {booking.notes ? (
                    <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-xs text-ink-soft">
                      “{booking.notes}”
                    </p>
                  ) : null}
                </div>

                {booking.status !== "CANCELLED" && booking.startsAt >= now ? (
                  <div className="flex shrink-0 items-center gap-2">
                    {booking.status === "PENDING" ? (
                      <form action={setBookingStatusAction}>
                        <input type="hidden" name="id" value={booking.id} />
                        <input type="hidden" name="status" value="CONFIRMED" />
                        <button
                          type="submit"
                          className="rounded-lg bg-moss px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-moss-deep"
                        >
                          Confirmar
                        </button>
                      </form>
                    ) : null}
                    <form action={setBookingStatusAction}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button
                        type="submit"
                        className="rounded-lg border border-line-strong px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-clay/50 hover:text-clay"
                      >
                        Cancelar
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted">
        O cliente também pode cancelar pelo link de confirmação recebido por
        e-mail.
      </p>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white"
          : "rounded-lg border border-line px-3.5 py-2 text-sm text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-paper-deep" />
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl bg-paper-deep"
        />
      ))}
    </div>
  );
}
