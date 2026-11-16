import { Suspense } from "react";
import { toggleServiceAction } from "@/app/actions/dashboard";
import {
  CreateServiceForm,
  DeleteServiceButton,
  EditServiceForm,
} from "@/components/service-forms";
import { Alert, Badge, Card, EmptyState, PageTitle } from "@/components/ui";
import { requireBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatPrice } from "@/lib/time";

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}

async function ServicesContent() {
  const business = await requireBusiness();

  const services = await prisma.service.findMany({
    where: { businessId: business.id },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="serviços"
        title="O que você oferece"
        description="Cada serviço define a duração reservada na agenda — o site nunca oferece um horário sem tempo suficiente."
      />

      <Card>
        <h2 className="text-sm font-semibold">Novo serviço</h2>
        <p className="mt-1 mb-4 text-xs text-muted">
          A duração é usada para calcular os horários disponíveis.
        </p>
        <CreateServiceForm />
      </Card>

      {services.length === 0 ? (
        <EmptyState
          title="Nenhum serviço cadastrado"
          description="Cadastre o primeiro serviço acima para liberar agendamentos na sua página."
        />
      ) : (
        <ul className="space-y-3">
          {services.map((service) => (
            <li
              key={service.id}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{service.name}</p>
                    {service.active ? (
                      <Badge tone="navy">ativo</Badge>
                    ) : (
                      <Badge tone="neutral">desativado</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatDuration(service.durationMin)} ·{" "}
                    {service.priceCents === 0
                      ? "Gratuito"
                      : formatPrice(service.priceCents)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <form action={toggleServiceAction}>
                    <input type="hidden" name="id" value={service.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={service.active ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className="text-xs font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                    >
                      {service.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                  <DeleteServiceButton id={service.id} name={service.name} />
                </div>
              </div>

              <details className="group mt-4 border-t border-line pt-4">
                <summary className="cursor-pointer text-xs font-medium text-muted hover:text-ink">
                  Editar serviço
                </summary>
                <div className="mt-4">
                  <EditServiceForm
                    service={{
                      id: service.id,
                      name: service.name,
                      durationMin: service.durationMin,
                      priceCents: service.priceCents,
                    }}
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <Alert tone="info">
        Serviços com agendamentos futuros não podem ser excluídos — desative-os
        para sumir da página pública sem perder o histórico.
      </Alert>
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-paper-deep" />
      <div className="h-40 animate-pulse rounded-2xl bg-paper-deep" />
      <div className="h-28 animate-pulse rounded-2xl bg-paper-deep" />
    </div>
  );
}
