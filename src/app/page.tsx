import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Publique seus horários",
    text: "Defina serviços, duração e a grade de atendimento. Sua página fica em um link curto, pronto para o Instagram.",
  },
  {
    number: "02",
    title: "O cliente escolhe o horário",
    text: "A página mostra só o que está livre de verdade — respeitando duração do serviço, expediente e o que já foi marcado.",
  },
  {
    number: "03",
    title: "Você confirma no painel",
    text: "O pedido chega com nome e contato, ganha confirmação por e-mail e pode ser remarcado pelo próprio cliente.",
  },
];

const features = [
  {
    title: "Sem conflito de horário",
    text: "Duas reservas no mesmo horário são bloqueadas no banco, inclusive em acessos simultâneos.",
  },
  {
    title: "E-mail automático",
    text: "Confirmação com serviço, data, endereço e link de cancelamento enviada no ato da reserva.",
  },
  {
    title: "Cliente sem cadastro",
    text: "Ninguém precisa criar conta para marcar. Só quem administra a agenda faz login.",
  },
  {
    title: "Renderizado no servidor",
    text: "A página pública chega pronta do servidor com os horários do dia, sem esperar JavaScript.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            encaixe
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink-soft sm:flex">
            <a href="#como-funciona" className="hover:text-ink">
              Como funciona
            </a>
            <a href="#recursos" className="hover:text-ink">
              Recursos
            </a>
            <Link href="/b/studio-navalha" className="hover:text-ink">
              Exemplo
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-moss px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-moss-deep"
            >
              Criar agenda
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-moss">
              agendamento online
            </p>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Sua agenda cheia,
              <br />
              sem trocar mensagem.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
              O Encaixe é a agenda online de barbearias, clínicas e estúdios: um
              link público com os horários livres, confirmação por e-mail e um
              painel simples para o dia a dia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Criar minha agenda com GitHub
              </Link>
              <Link
                href="/b/studio-navalha"
                className="rounded-xl border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-card"
              >
                Ver demonstração
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted">
              Demo pronta: barbearia com 3 serviços, horários de terça a sábado
              e agendamentos reais.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[28px] bg-moss-soft" aria-hidden />
            <div className="relative rounded-3xl border border-line bg-card p-6 shadow-[0_18px_50px_-30px_rgba(23,21,15,0.45)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    studio navalha
                  </p>
                  <p className="mt-1 text-lg font-semibold">Escolha seu horário</p>
                </div>
                <span className="rounded-full bg-moss-soft px-2.5 py-1 text-[11px] font-medium text-moss-deep">
                  14 dias
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                {[
                  ["ter", "18"],
                  ["qua", "19"],
                  ["qui", "20"],
                ].map(([weekday, day], index) => (
                  <div
                    key={day}
                    className={
                      index === 1
                        ? "flex-1 rounded-xl bg-moss px-3 py-2.5 text-center text-white"
                        : "flex-1 rounded-xl border border-line px-3 py-2.5 text-center text-ink-soft"
                    }
                  >
                    <p className="text-[11px] uppercase tracking-wide opacity-80">
                      {weekday}
                    </p>
                    <p className="text-base font-semibold">{day}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {["09:00", "09:45", "10:30", "11:15", "14:00", "14:45", "15:30", "16:15", "17:00"].map(
                  (time, index) => (
                    <div
                      key={time}
                      className={
                        index === 4
                          ? "rounded-lg border border-moss bg-moss-soft px-2 py-2 text-center text-xs font-medium text-moss-deep"
                          : "rounded-lg border border-line px-2 py-2 text-center text-xs text-ink-soft"
                      }
                    >
                      {time}
                    </div>
                  ),
                )}
              </div>

              <div className="mt-5 rounded-xl border border-line bg-paper px-4 py-3">
                <p className="text-xs text-muted">Corte + barba · 1h15</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-medium">Quinta, 20 de nov · 14:00</p>
                  <span className="text-sm font-semibold text-moss">R$ 90</span>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-ink px-4 py-3 text-center text-sm font-medium text-white">
                Confirmar agendamento
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-line bg-card/60">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              como funciona
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number}>
                  <p className="font-mono text-xs text-moss">{step.number}</p>
                  <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="recursos" className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                o que está por dentro
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                O essencial bem feito, sem menu infinito.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                Cada detalhe existe para resolver uma dor real de quem atende
                sozinho: horário perdido, cliente que não aparece e mensagem
                fora de hora.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "barbearias",
                  "clínicas",
                  "salões",
                  "estúdios de tatuagem",
                  "personal trainers",
                  "consultórios",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line-strong px-3 py-1 text-xs text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-line bg-card p-5"
                >
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20">
          <div className="rounded-3xl bg-moss-deep px-8 py-12 text-white sm:px-12">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Pronto para encaixar o próximo cliente?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Entre com o GitHub e sua página de agendamento é criada na
                  hora, com serviços e horários padrão editáveis.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-moss-deep transition-colors hover:bg-white/90"
                >
                  Criar agenda
                </Link>
                <Link
                  href="/b/studio-navalha"
                  className="rounded-xl border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Ver demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted">
          <p>Encaixe · agendamento online para pequenos negócios</p>
          <p>
            Projeto de portfólio ·{" "}
            <a
              href="https://github.com/VictorStavarengo"
              className="text-ink-soft hover:underline"
            >
              Victor Stavarengo
            </a>{" "}
            · Next.js 16, Postgres, Prisma e Auth.js
          </p>
        </div>
      </footer>
    </div>
  );
}
