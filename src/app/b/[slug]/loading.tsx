export default function BookingLoading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen flex-col">
      <span className="sr-only">Carregando horários…</span>

      <header className="border-b border-line bg-card/60">
        <div className="mx-auto flex w-full max-w-3xl items-start gap-4 px-5 py-8">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-paper-deep" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded-full bg-paper-deep/70" />
            <div className="h-8 w-2/3 max-w-xs animate-pulse rounded-lg bg-paper-deep" />
            <div className="h-4 w-1/2 max-w-56 animate-pulse rounded bg-paper-deep/70" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-5 py-10">
        {Array.from({ length: 3 }, (_, section) => (
          <section key={section} className="space-y-3">
            <div className="h-4 w-36 animate-pulse rounded bg-paper-deep" />
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: section === 2 ? 6 : 2 }, (_, item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl border border-line bg-card/60"
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
