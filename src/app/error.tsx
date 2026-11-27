"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line/80 bg-paper/85">
        <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-4">
          <Link href="/" aria-label="Encaixe — página inicial">
            <Brand />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-clay">
          <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden />
          algo saiu do esperado
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
          Ocorreu uma falha inesperada ao processar sua solicitação. Tente
          novamente; se o problema continuar, volte em alguns minutos.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={reset}>Tentar de novo</Button>
          <Link
            href="/"
            className="rounded-xl border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-navy/40 hover:bg-card"
          >
            Ir para o início
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-8 font-mono text-xs text-muted">
            Código do erro: {error.digest}
          </p>
        ) : null}
      </main>
    </div>
  );
}
