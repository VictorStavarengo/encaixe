import { Badge } from "@/components/ui";

export function StatusBadge({
  status,
}: {
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}) {
  if (status === "CONFIRMED")
    return (
      <Badge tone="navy" dot>
        confirmado
      </Badge>
    );
  if (status === "CANCELLED")
    return (
      <Badge tone="clay" dot>
        cancelado
      </Badge>
    );
  return (
    <Badge tone="sand" dot>
      pendente
    </Badge>
  );
}
