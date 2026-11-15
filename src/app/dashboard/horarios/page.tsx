import { Suspense } from "react";
import { HoursForm } from "@/components/hours-form";
import { Alert, Card, PageTitle } from "@/components/ui";
import { requireBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";

export default function HoursPage() {
  return (
    <Suspense fallback={<HoursSkeleton />}>
      <HoursContent />
    </Suspense>
  );
}

async function HoursContent() {
  const business = await requireBusiness();

  const hours = await prisma.openingHours.findMany({
    where: { businessId: business.id },
  });

  const initial = Array.from({ length: 7 }, (_, weekday) => {
    const entry = hours.find((item) => item.weekday === weekday);
    return entry ? { opensAt: entry.opensAt, closesAt: entry.closesAt } : null;
  });

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="horários"
        title="Quando você atende"
        description="A grade define o expediente da sua página pública. Os intervalos são gerados a cada 30 minutos e respeitam a duração do serviço."
      />

      <Card>
        <HoursForm initial={initial} />
      </Card>

      <Alert tone="info">
        Agendamentos já marcados continuam válidos mesmo que você feche o dia
        depois — cancele-os na aba “Agendamentos” se necessário.
      </Alert>
    </div>
  );
}

function HoursSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-paper-deep" />
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-xl bg-paper-deep"
        />
      ))}
    </div>
  );
}
