import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cancelBookingByTokenAction } from "@/app/actions/booking";
import { CancelBookingForm } from "@/components/cancel-booking-form";
import { Badge } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import {
  formatDateTimeLong,
  formatDuration,
  formatPrice,
} from "@/lib/time";

export const metadata: Metadata = {
  title: "Agendamento",
  robots: { index: false },
};

export default function ConfirmationPage(
  props: PageProps<"/b/[slug]/confirmado/[token]">,
) {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent
        params={props.params as Promise<{ slug: string; token: string }>}
      />
    </Suspense>
  );
}

async function ConfirmationContent({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: { business: true },
  });

  if (!booking || booking.business.slug !== slug) notFound();

  const cancelled = booking.status === "CANCELLED";
  const durationMin = Math.round(
    (booking.endsAt.getTime() - booking.startsAt.getTime()) / 60_000,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12">
        <div
          className={
            cancelled
              ? "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-clay-soft text-clay"
              : "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-moss-soft text-moss-deep"
          }
        >
          {cancelled ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          {booking.business.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {cancelled ? "Horário cancelado" : "Horário reservado"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {cancelled
            ? "O horário voltou a ficar disponível na página de agendamento."
            : `Enviamos a confirmação para ${booking.customerEmail}. Guarde este link para cancelar ou remarcar.`}
        </p>

        <dl className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card px-5">
          <Row label="Serviço" value={booking.serviceName} />
          <Row
            label="Quando"
            value={formatDateTimeLong(booking.startsAt, booking.business.timezone)}
          />
          <Row label="Duração" value={formatDuration(durationMin)} />
          <Row
            label="Valor"
            value={
              booking.servicePriceCents === 0
                ? "Gratuito"
                : formatPrice(booking.servicePriceCents)
            }
          />
          <Row label="Cliente" value={booking.customerName} />
          {booking.business.address ? (
            <Row label="Endereço" value={booking.business.address} />
          ) : null}
          <Row
            label="Situação"
            value={
              cancelled ? (
                <Badge tone="clay">cancelado</Badge>
              ) : booking.status === "CONFIRMED" ? (
                <Badge tone="moss">confirmado</Badge>
              ) : (
                <Badge tone="sand">aguardando o negócio</Badge>
              )
            }
          />
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/b/${slug}`}
            className="rounded-xl border border-line-strong px-4 py-2.5 text-sm font-medium transition-colors hover:bg-card"
          >
            Agendar outro horário
          </Link>
          {cancelled ? null : (
            <CancelBookingForm
              action={cancelBookingByTokenAction}
              token={booking.cancelToken}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-xl px-5 py-5 text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            agenda criada com <span className="font-medium text-ink">encaixe</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-16">
      <div className="h-12 w-12 animate-pulse rounded-full bg-paper-deep" />
      <div className="mt-6 h-8 w-1/2 animate-pulse rounded-lg bg-paper-deep" />
      <div className="mt-8 h-64 animate-pulse rounded-2xl bg-paper-deep" />
    </div>
  );
}
