"use client";

import { useActionState, useState } from "react";
import { createBookingAction, type BookingFormState } from "@/app/actions/booking";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";

type SlotOption = {
  startsAt: string;
  label: string;
  endsAt: string;
};

export function BookingForm({
  slug,
  serviceId,
  serviceName,
  serviceMeta,
  slots,
}: {
  slug: string;
  serviceId: string;
  serviceName: string;
  serviceMeta: string;
  slots: SlotOption[];
}) {
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(
    createBookingAction,
    null,
  );
  const [selected, setSelected] = useState(slots[0]?.startsAt ?? "");

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-card px-5 py-10 text-center">
        <p className="text-sm font-medium">Nenhum horário livre nesse dia</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Todos os horários desta data já foram preenchidos ou passaram. Escolha
          outro dia na lista acima.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="startsAt" value={selected} />

      <div className="rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <p className="text-sm font-medium">{serviceName}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{serviceMeta}</p>
          </div>
          <span className="rounded-full bg-moss-soft px-2.5 py-1 text-[11px] font-medium text-moss-deep">
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
                      ? "rounded-lg border border-moss bg-moss px-2 py-2.5 text-sm font-semibold text-white"
                      : "rounded-lg border border-line bg-paper px-2 py-2.5 text-sm text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                  }
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </fieldset>
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Sem cadastro. Você recebe a confirmação por e-mail e pode cancelar pelo
          mesmo link.
        </p>
        <Button type="submit" disabled={pending || !selected}>
          {pending ? "Reservando…" : "Confirmar agendamento"}
        </Button>
      </div>
    </form>
  );
}
