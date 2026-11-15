"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const items = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/agendamentos", label: "Agendamentos" },
  { href: "/dashboard/servicos", label: "Serviços" },
  { href: "/dashboard/horarios", label: "Horários" },
  { href: "/dashboard/pagina", label: "Página pública" },
  { href: "/dashboard/emails", label: "E-mails" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 lg:flex-col">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-ink text-white"
                : "text-ink-soft hover:bg-paper-deep hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
