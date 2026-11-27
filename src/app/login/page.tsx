import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { signIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse o painel do Encaixe com sua conta do GitHub.",
};

export default function LoginPage() {
  const githubConfigured = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-navy-deep p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />
        <Link href="/" className="relative" aria-label="Encaixe — página inicial">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-sm font-semibold leading-none">
              e
            </span>
            <span className="font-display text-lg font-bold tracking-tight">encaixe</span>
          </span>
        </Link>
        <div className="max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            agendamento online
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-bold">
            Um link, a agenda cheia.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            Publique seus horários, receba os pedidos na página pública e
            confirme tudo em um painel só. Sem planilha, sem troca de mensagem.
          </p>
        </div>
        <dl className="relative grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6 text-[13px] leading-snug">
          <div>
            <dt className="text-white/60">No ar em</dt>
            <dd className="mt-1 font-medium">1 minuto</dd>
          </div>
          <div>
            <dt className="text-white/60">E-mail</dt>
            <dd className="mt-1 font-medium">automático</dd>
          </div>
          <div>
            <dt className="text-white/60">Conflito</dt>
            <dd className="mt-1 font-medium">bloqueado</dd>
          </div>
        </dl>
      </section>

      <section className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
        <Link href="/" className="lg:hidden" aria-label="Encaixe — página inicial">
          <Brand />
        </Link>
          <h1 className="mt-8 font-display text-2xl font-bold tracking-tight lg:mt-0">
            Entrar no painel
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Use sua conta do GitHub. Na primeira entrada criamos sua página de
            agendamento com horários padrão para você ajustar.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              disabled={!githubConfigured}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-navy px-4 py-3 text-sm font-medium text-white shadow-[0_2px_10px_-5px_rgba(13,35,64,0.7)] transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GitHubMark />
              Continuar com GitHub
            </button>
          </form>

          {githubConfigured ? null : (
            <p className="mt-4 rounded-xl border border-line-strong bg-paper-deep px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
              Login indisponível neste ambiente: configure{" "}
              <code className="font-mono text-[11px]">AUTH_GITHUB_ID</code> e{" "}
              <code className="font-mono text-[11px]">AUTH_GITHUB_SECRET</code>{" "}
              no <code className="font-mono text-[11px]">.env</code>.
            </p>
          )}

          <p className="mt-8 text-xs text-muted">
            Só usamos seu nome e foto públicas do GitHub para identificar o
            painel.{" "}
            <Link href="/b/doze-e-meia" className="text-navy hover:underline">
              Ver uma página de exemplo
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-current">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
