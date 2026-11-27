"use client";

import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-clay">
        <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden />
        painel indisponível
      </p>
      <h1 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
        Não foi possível carregar o painel
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        A operação falhou antes de terminar. Nada foi alterado na sua agenda.
        Tente novamente.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={reset}>Tentar de novo</Button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Voltar à visão geral
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-xs text-muted">
          Código do erro: {error.digest}
        </p>
      ) : null}
    </Card>
  );
}
