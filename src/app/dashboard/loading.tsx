export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-8">
      <span className="sr-only">Carregando painel…</span>

      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-paper-deep" />
        <div className="h-8 w-2/3 max-w-sm animate-pulse rounded-lg bg-paper-deep" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-paper-deep/70" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-line bg-card/60"
          />
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card/60 p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-paper-deep" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-paper-deep" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-paper-deep" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-paper-deep/70" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-paper-deep/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
