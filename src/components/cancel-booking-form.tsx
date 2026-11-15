"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function CancelBookingForm({
  action,
  token,
}: {
  action: (formData: FormData) => Promise<void>;
  token: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="danger">
            Sim, cancelar horário
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirming(false)}
          >
            Manter agendamento
          </Button>
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setConfirming(true)}>
          Cancelar agendamento
        </Button>
      )}
    </form>
  );
}
