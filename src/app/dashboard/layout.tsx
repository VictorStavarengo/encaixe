import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/app/actions/dashboard";
import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireSessionUser } from "@/lib/business";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-card/60 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-6 px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" aria-label="Encaixe — painel">
              <Brand />
            </Link>
            <Link
              href="/"
              className="text-xs text-muted hover:text-ink lg:hidden"
            >
              site
            </Link>
          </div>

          <DashboardNav />

          <div className="mt-auto hidden lg:block">
            <Suspense fallback={<UserSkeleton />}>
              <UserBox />
            </Suspense>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}

async function UserBox() {
  const user = await requireSessionUser();

  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <div className="flex items-center gap-2.5">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 rounded-full border border-line"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-xs font-semibold">
            {(user.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {user.name ?? "Conta"}
          </p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </div>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          Sair
        </button>
      </form>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-xl border border-line bg-paper-deep/60" />
  );
}
