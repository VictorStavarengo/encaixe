"use client";

import { useActionState, useState } from "react";
import { saveHoursAction, type FormState } from "@/app/actions/dashboard";
import { Alert, Button, Input } from "@/components/ui";
import { weekdayName } from "@/lib/time";

type DayHours = {
  opensAt: string;
  closesAt: string;
};

export function HoursForm({
  initial,
}: {
  // índice 0 = domingo ... 6 = sábado; null quando fechado
  initial: Array<DayHours | null>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveHoursAction,
    null,
  );
  const [closedDays, setClosedDays] = useState(
    initial.map((hours) => hours === null),
  );

  return (
    <form action={formAction} className="space-y-3">
      {initial.map((hours, weekday) => (
        <div
          key={weekday}
          className="flex flex-col gap-3 rounded-xl border border-line px-4 py-3 sm:grid sm:grid-cols-[140px_auto_1fr] sm:items-center sm:gap-4"
        >
          <div className="flex items-center justify-between gap-3 sm:contents">
            <p className="text-sm font-medium capitalize">{weekdayName(weekday)}</p>
            <label className="flex items-center gap-2 text-xs text-ink-soft sm:order-last sm:justify-self-end">
              <input
                type="checkbox"
                name={`closed-${weekday}`}
                checked={closedDays[weekday]}
                onChange={(event) => {
                  const next = [...closedDays];
                  next[weekday] = event.target.checked;
                  setClosedDays(next);
                }}
                className="h-4 w-4 rounded border-line-strong accent-navy"
              />
              fechado
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="time"
              name={`open-${weekday}`}
              defaultValue={hours?.opensAt ?? "09:00"}
              aria-label={`Abertura de ${weekdayName(weekday)}`}
              disabled={closedDays[weekday]}
              className="w-32"
            />
            <span className="text-xs text-muted">até</span>
            <Input
              type="time"
              name={`close-${weekday}`}
              defaultValue={hours?.closesAt ?? "18:00"}
              aria-label={`Fechamento de ${weekdayName(weekday)}`}
              disabled={closedDays[weekday]}
              className="w-32"
            />
          </div>
        </div>
      ))}

      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state?.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted">
          Os horários usam o fuso configurado em “Página pública”.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar horários"}
        </Button>
      </div>
    </form>
  );
}
