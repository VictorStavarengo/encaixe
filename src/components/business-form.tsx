"use client";

import { useActionState } from "react";
import { saveBusinessAction, type FormState } from "@/app/actions/dashboard";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

const timezones = [
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "America/Bahia", label: "Bahia" },
  { value: "America/Fortaleza", label: "Fortaleza" },
  { value: "America/Recife", label: "Recife" },
  { value: "America/Belem", label: "Belém" },
  { value: "America/Cuiaba", label: "Cuiabá" },
  { value: "America/Manaus", label: "Manaus (AMT)" },
  { value: "America/Porto_Velho", label: "Porto Velho" },
  { value: "America/Rio_Branco", label: "Rio Branco" },
];

export function BusinessForm({
  business,
}: {
  business: {
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    timezone: string;
  };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveBusinessAction,
    null,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome do negócio" htmlFor="name" error={state?.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={business.name} required />
      </Field>
      <Field
        label="Link da página"
        htmlFor="slug"
        error={state?.fieldErrors?.slug}
        hint="Precisa ser único no Encaixe"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted">/b/</span>
          <Input id="slug" name="slug" defaultValue={business.slug} required />
        </div>
      </Field>
      <Field
        label="Telefone / WhatsApp"
        htmlFor="phone"
        error={state?.fieldErrors?.phone}
        hint="Aparece na página pública (opcional)"
      >
        <Input
          id="phone"
          name="phone"
          defaultValue={business.phone ?? ""}
          placeholder="(11) 99999-0000"
        />
      </Field>
      <Field
        label="Endereço"
        htmlFor="address"
        error={state?.fieldErrors?.address}
        hint="Ajuda o cliente a chegar (opcional)"
      >
        <Input
          id="address"
          name="address"
          defaultValue={business.address ?? ""}
          placeholder="Rua das Flores, 120 · São Paulo"
        />
      </Field>
      <Field
        label="Fuso horário"
        htmlFor="timezone"
        error={state?.fieldErrors?.timezone}
      >
        <Select id="timezone" name="timezone" defaultValue={business.timezone}>
          {timezones.map((zone) => (
            <option key={zone.value} value={zone.value}>
              {zone.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>

      {state?.error ? (
        <div className="sm:col-span-2">
          <Alert tone="error">{state.error}</Alert>
        </div>
      ) : null}
      {state?.success ? (
        <div className="sm:col-span-2">
          <Alert tone="success">{state.success}</Alert>
        </div>
      ) : null}
    </form>
  );
}
