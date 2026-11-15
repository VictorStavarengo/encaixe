import { Badge } from "@/components/ui";

export function StatusBadge({
  status,
}: {
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}) {
  if (status === "CONFIRMED") return <Badge tone="moss">confirmado</Badge>;
  if (status === "CANCELLED") return <Badge tone="clay">cancelado</Badge>;
  return <Badge tone="sand">pendente</Badge>;
}
