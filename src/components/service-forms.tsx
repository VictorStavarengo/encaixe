"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
  type FormState,
} from "@/app/actions/dashboard";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

const durations = [15, 30, 45, 60, 75, 90, 120];

export function CreateServiceForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createServiceAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-4">
      <Field
        label="Serviço"
        htmlFor="new-name"
        error={state?.fieldErrors?.name}
        hint={undefined}
      >
        <Input id="new-name" name="name" placeholder="Corte feminino" required />
      </Field>
      <Field
        label="Duração"
        htmlFor="new-duration"
        error={state?.fieldErrors?.durationMin}
      >
        <Select id="new-duration" name="durationMin" defaultValue="30">
          {durations.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} min
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Preço" htmlFor="new-price" error={state?.fieldErrors?.price}>
        <Input id="new-price" name="price" placeholder="60,00" inputMode="decimal" />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando…" : "Adicionar"}
        </Button>
      </div>
      {state?.error ? (
        <div className="sm:col-span-4">
          <Alert tone="error">{state.error}</Alert>
        </div>
      ) : null}
      {state?.success ? (
        <div className="sm:col-span-4">
          <Alert tone="success">{state.success}</Alert>
        </div>
      ) : null}
    </form>
  );
}

export function EditServiceForm({
  service,
}: {
  service: {
    id: string;
    name: string;
    durationMin: number;
    priceCents: number;
  };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateServiceAction,
    null,
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-4">
      <input type="hidden" name="id" value={service.id} />
      <Field label="Nome" htmlFor={`name-${service.id}`} error={state?.fieldErrors?.name}>
        <Input
          id={`name-${service.id}`}
          name="name"
          defaultValue={service.name}
          required
        />
      </Field>
      <Field label="Duração" htmlFor={`duration-${service.id}`}>
        <Select
          id={`duration-${service.id}`}
          name="durationMin"
          defaultValue={String(service.durationMin)}
        >
          {durations.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} min
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Preço" htmlFor={`price-${service.id}`} error={state?.fieldErrors?.price}>
        <Input
          id={`price-${service.id}`}
          name="price"
          defaultValue={(service.priceCents / 100).toFixed(2).replace(".", ",")}
          inputMode="decimal"
        />
      </Field>
      <div className="flex items-end">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full">
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
      {state?.error ? (
        <div className="sm:col-span-4">
          <Alert tone="error">{state.error}</Alert>
        </div>
      ) : null}
      {state?.success ? (
        <div className="sm:col-span-4">
          <Alert tone="success">{state.success}</Alert>
        </div>
      ) : null}
    </form>
  );
}

export function DeleteServiceButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    deleteServiceAction,
    null,
  );
  const [confirming, setConfirming] = useState(false);

  if (state?.error) {
    return <Alert tone="error">{state.error}</Alert>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <span className="flex items-center gap-2">
          <Button type="submit" variant="danger" disabled={pending}>
            {pending ? "Excluindo…" : `Excluir “${name}”`}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs font-medium text-muted underline-offset-4 hover:text-clay hover:underline"
        >
          Excluir
        </button>
      )}
    </form>
  );
}
