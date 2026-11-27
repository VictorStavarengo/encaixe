"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createBookingAction, type BookingFormState } from "@/app/actions/booking";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";

type SlotOption = {
  startsAt: string;
  label: string;
  endsAt: string;
};

type NextDay = {
  href: string;
  label: string;
};

export function BookingForm({
  slug,
  serviceId,
  serviceName,
  serviceMeta,
  dateLabel,
  nextDay,
  slots,
}: {
  slug: string;
  serviceId: string;
  serviceName: string;
  serviceMeta: string;
  dateLabel: string;
  nextDay: NextDay | null;
  slots: SlotOption[];
}) {
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(
    createBookingAction,
    null,
  );
  const [selected, setSelected] = useState(slots[0]?.startsAt ?? "");
  const selectedSlot = slots.find((slot) => slot.startsAt === selected);

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-card px-6 py-10 text-center">
        <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-navy-soft text-navy">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2M3.5 3.5l17 17" />
          </svg>
        </span>
        <p className="text-sm font-medium">Nenhum horário livre nesse dia</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Todos os horários desta data já foram preenchidos ou passaram.
        </p>
        {nextDay ? (
          <Link
            href={nextDay.href}
            scroll={false}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white shadow-[0_2px_8px_-4px_rgba(10,42,86,0.6)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-navy-deep hover:shadow-[0_10px_22px_-14px_rgba(10,42,86,0.6)]"
          >
            Ver {nextDay.label}
            <span aria-hidden>→</span>
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="startsAt" value={selected} />

      <div className="rounded-2xl border border-line bg-paper-deep/60 p-5">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <p className="text-sm font-semibold">{serviceName}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{serviceMeta}</p>
          </div>
          <span className="rounded-full bg-navy-soft px-2.5 py-1 text-[11px] font-semibold text-navy-deep">
            {slots.length} horários
          </span>
        </div>

        <fieldset className="mt-4">
          <legend className="sr-only">Escolha o horário</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const active = slot.startsAt === selected;

              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(slot.startsAt)}
                  className={
                    active
                      ? "min-h-11 rounded-lg border border-navy bg-navy px-2 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_-8px_rgba(10,42,86,0.6)] transition-colors duration-150 hover:border-navy-deep hover:bg-navy-deep"
                      : "min-h-11 rounded-lg border border-line bg-card px-2 py-2.5 text-sm font-medium text-ink-soft transition-[border-color,color,background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-navy/40 hover:text-ink hover:shadow-[0_10px_18px_-16px_rgba(11,17,32,0.55)]"
                  }
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/20 bg-navy-soft px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-navy-deep/80">
          Você está marcando
        </span>
        <span className="text-sm font-bold text-navy-deep">
          {dateLabel}
          {selectedSlot ? ` · ${selectedSlot.label}` : ""}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Seu nome"
          htmlFor="customerName"
          error={state?.fieldErrors?.customerName}
        >
          <Input
            id="customerName"
            name="customerName"
            autoComplete="name"
            placeholder="Maria Silva"
            required
          />
        </Field>
        <Field
          label="E-mail"
          htmlFor="customerEmail"
          error={state?.fieldErrors?.customerEmail}
          hint="A confirmação vai para este endereço"
        >
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            autoComplete="email"
            placeholder="maria@email.com"
            required
          />
        </Field>
        <Field
          label="WhatsApp (opcional)"
          htmlFor="customerPhone"
          error={state?.fieldErrors?.customerPhone}
        >
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-0000"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Observação (opcional)"
            htmlFor="notes"
            error={state?.fieldErrors?.notes}
          >
            <Textarea
              id="notes"
              name="notes"
              placeholder="Ex.: primeira visita, alergia, preferência de horário."
              maxLength={300}
              className="min-h-20"
            />
          </Field>
        </div>
      </div>

      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-soft">
          Sem cadastro. Você recebe a confirmação por e-mail e pode cancelar pelo
          mesmo link.
        </p>
        <Button
          type="submit"
          disabled={pending || !selected}
          className="w-full sm:w-auto"
        >
          {pending ? "Reservando…" : "Confirmar agendamento"}
        </Button>
      </div>
    </form>
  );
}
