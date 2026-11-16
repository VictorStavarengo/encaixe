"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/components/ui";

const items: Array<{ href: string; label: string; icon: ReactNode }> = [
  {
    href: "/dashboard",
    label: "Visão geral",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
      </svg>
    ),
  },
  {
    href: "/dashboard/agendamentos",
    label: "Agendamentos",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 7.5 9.5 18l-2.8-2.8L17.2 4.7a1.8 1.8 0 0 1 2.5 0l.3.3a1.8 1.8 0 0 1 0 2.5Z" />
        <path d="m4 20 2-2M4 14l2 2M10 20l-2-2" />
      </svg>
    ),
  },
  {
    href: "/dashboard/horarios",
    label: "Horários",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
  },
  {
    href: "/dashboard/pagina",
    label: "Página pública",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.5 6.3" />
        <path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.3-1.3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/emails",
    label: "E-mails",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="m4.5 7 7.5 5.5L19.5 7" />
      </svg>
    ),
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-navy text-white shadow-[0_1px_2px_rgba(13,35,64,0.25)]"
                : "text-ink-soft hover:bg-paper-deep hover:text-ink",
            )}
          >
            <span className={active ? "opacity-90" : "text-muted"}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
