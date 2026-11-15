import { Suspense } from "react";
import { Alert, Badge, EmptyState, PageTitle } from "@/components/ui";
import { requireBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { formatDateTimeLong } from "@/lib/time";

export default function EmailsPage() {
  return (
    <Suspense fallback={<EmailsSkeleton />}>
      <EmailsContent />
    </Suspense>
  );
}

async function EmailsContent() {
  const business = await requireBusiness();

  const emails = await prisma.emailLog.findMany({
    where: { booking: { businessId: business.id } },
    orderBy: { sentAt: "desc" },
    take: 30,
    include: {
      booking: { select: { customerName: true, startsAt: true } },
    },
  });

  const configured = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="e-mails"
        title="O que saiu da sua agenda"
        description="Toda reserva dispara a confirmação com data, serviço e link de cancelamento. Aqui você vê o que foi enviado."
      />

      {configured ? (
        <Alert tone="success">
          Envio ativo via Resend. Os e-mails abaixo foram entregues de verdade.
        </Alert>
      ) : (
        <Alert tone="info">
          Modo demonstração: sem <code className="font-mono text-xs">RESEND_API_KEY</code>{" "}
          configurada, os e-mails são renderizados aqui em vez de enviados.
        </Alert>
      )}

      {emails.length === 0 ? (
        <EmptyState
          title="Nenhum e-mail ainda"
          description="Assim que o primeiro agendamento for feito, a confirmação aparece aqui para conferência."
        />
      ) : (
        <ul className="space-y-3">
          {emails.map((email) => (
            <li
              key={email.id}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{email.subject}</p>
                  <p className="mt-1 text-xs text-muted">
                    para {email.to} ·{" "}
                    {formatDateTimeLong(email.sentAt, business.timezone)}
                  </p>
                </div>
                <Badge tone={email.provider === "resend" ? "moss" : "sand"}>
                  {email.provider === "resend" ? "enviado" : "preview"}
                </Badge>
              </div>

              {email.error ? (
                <p className="mt-3 rounded-lg bg-clay-soft px-3 py-2 text-xs text-clay">
                  {email.error}
                </p>
              ) : null}

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-muted hover:text-ink">
                  Ver conteúdo do e-mail
                </summary>
                <div className="mt-3 overflow-hidden rounded-xl border border-line">
                  <iframe
                    title={`E-mail para ${email.to}`}
                    srcDoc={email.html}
                    sandbox=""
                    className="h-96 w-full bg-white"
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmailsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-paper-deep" />
      <div className="h-20 animate-pulse rounded-2xl bg-paper-deep" />
      <div className="h-28 animate-pulse rounded-2xl bg-paper-deep" />
    </div>
  );
}
