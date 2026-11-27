import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line/80 bg-paper/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Encaixe — página inicial">
            <Brand />
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(13,35,64,0.28)] transition-colors hover:bg-navy-deep"
          >
            Criar agenda
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-navy">
          <span className="h-1.5 w-1.5 rounded-full bg-navy" aria-hidden />
          erro 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Página não encontrada
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
          O endereço acessado não existe ou foi removido. Se você chegou por um
          link de agendamento, confira se o slug do negócio está completo.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-[0_2px_10px_-4px_rgba(13,35,64,0.6)] transition-colors hover:bg-navy-deep"
          >
            Voltar ao início
          </Link>
          <Link
            href="/b/doze-e-meia"
            className="rounded-xl border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-navy/40 hover:bg-card"
          >
            Ver demonstração
          </Link>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-xs text-muted">
          Encaixe · agendamento online para pequenos negócios
        </div>
      </footer>
    </div>
  );
}
