import { prisma } from "@/lib/prisma";
import {
  formatDateTimeLong,
  formatDuration,
  formatPrice,
} from "@/lib/time";

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type EmailResult = {
  provider: "resend" | "preview";
  error?: string;
};

type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function renderBookingEmail(params: {
  customerName: string;
  businessName: string;
  address: string | null;
  serviceName: string;
  startsAtLabel: string;
  durationLabel: string;
  priceLabel: string;
  cancelUrl: string;
  pageUrl: string;
}): EmailContent {
  const {
    customerName,
    businessName,
    address,
    serviceName,
    startsAtLabel,
    durationLabel,
    priceLabel,
    cancelUrl,
    pageUrl,
  } = params;

  const subject = `Agendamento confirmado · ${businessName}`;

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1a16;">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6e2d8;border-radius:16px;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#7d7666;">${businessName}</p>
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;">Horário reservado, ${customerName}.</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b463b;">Seu agendamento foi registrado. Se precisar remarcar, cancele por este e-mail e escolha outro horário.</p>
          <table role="presentation" width="100%" style="border-top:1px solid #e6e2d8;font-size:15px;">
            <tr><td style="padding:12px 0;color:#7d7666;">Serviço</td><td style="padding:12px 0;text-align:right;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:12px 0;color:#7d7666;border-top:1px solid #f0ede6;">Quando</td><td style="padding:12px 0;text-align:right;font-weight:600;border-top:1px solid #f0ede6;">${startsAtLabel}</td></tr>
            <tr><td style="padding:12px 0;color:#7d7666;border-top:1px solid #f0ede6;">Duração</td><td style="padding:12px 0;text-align:right;border-top:1px solid #f0ede6;">${durationLabel}</td></tr>
            <tr><td style="padding:12px 0;color:#7d7666;border-top:1px solid #f0ede6;">Valor</td><td style="padding:12px 0;text-align:right;border-top:1px solid #f0ede6;">${priceLabel}</td></tr>
            ${address ? `<tr><td style="padding:12px 0;color:#7d7666;border-top:1px solid #f0ede6;">Endereço</td><td style="padding:12px 0;text-align:right;border-top:1px solid #f0ede6;">${address}</td></tr>` : ""}
          </table>
          <p style="margin:28px 0 8px;">
            <a href="${pageUrl}" style="display:inline-block;background:#16345f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;">Ver página do negócio</a>
          </p>
          <p style="margin:0;font-size:13px;color:#7d7666;line-height:1.6;">Precisa cancelar? <a href="${cancelUrl}" style="color:#7d7666;">Cancele por aqui</a> e o horário volta a ficar disponível.</p>
        </td>
      </tr>
    </table>
    <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#9b9484;text-align:center;">Enviado por Encaixe · agendamento online</p>
  </body>
</html>`;

  const text = [
    `${businessName} — agendamento confirmado`,
    "",
    `Serviço: ${serviceName}`,
    `Quando: ${startsAtLabel}`,
    `Duração: ${durationLabel}`,
    `Valor: ${priceLabel}`,
    address ? `Endereço: ${address}` : "",
    "",
    `Página do negócio: ${pageUrl}`,
    `Cancelar: ${cancelUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export async function sendBookingConfirmationEmail(
  bookingId: string,
): Promise<EmailResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { business: true },
  });

  if (!booking) return { provider: "preview", error: "Agendamento não encontrado" };

  const content = renderBookingEmail({
    customerName: booking.customerName,
    businessName: booking.business.name,
    address: booking.business.address,
    serviceName: booking.serviceName,
    startsAtLabel: formatDateTimeLong(booking.startsAt, booking.business.timezone),
    durationLabel: formatDuration(
      Math.round((booking.endsAt.getTime() - booking.startsAt.getTime()) / 60_000),
    ),
    priceLabel: formatPrice(booking.servicePriceCents ?? 0),
    cancelUrl: `${appUrl()}/b/${booking.business.slug}/confirmado/${booking.cancelToken}`,
    pageUrl: `${appUrl()}/b/${booking.business.slug}`,
  });

  const apiKey = process.env.RESEND_API_KEY;
  let provider: EmailResult["provider"] = "preview";
  let error: string | undefined;

  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Encaixe <agenda@encaixe.app>",
          to: booking.customerEmail,
          subject: content.subject,
          html: content.html,
          text: content.text,
        }),
      });

      if (response.ok) {
        provider = "resend";
      } else {
        error = `Resend ${response.status}: ${await response.text()}`;
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Falha ao enviar e-mail";
    }
  }

  await prisma.emailLog.create({
    data: {
      bookingId: booking.id,
      to: booking.customerEmail,
      subject: content.subject,
      html: content.html,
      provider,
      error,
    },
  });

  if (provider === "preview") {
    console.info(
      `[email:preview] ${content.subject} → ${booking.customerEmail}`,
    );
  }

  return { provider, error };
}
