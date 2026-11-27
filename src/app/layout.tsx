import type { Metadata, Viewport } from "next";
import { Geist, Sora } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Encaixe · agendamento online para pequenos negócios",
    template: "%s · Encaixe",
  },
  description:
    "Agendamento online para barbearias, clínicas e estúdios: página pública por link, horários sem conflito e confirmação automática por e-mail.",
  openGraph: {
    title: "Encaixe · agendamento online para pequenos negócios",
    description:
      "Agendamento online para barbearias, clínicas e estúdios: página pública por link, horários sem conflito e confirmação automática por e-mail.",
    type: "website",
    locale: "pt_BR",
    siteName: "Encaixe",
    url: appUrl,
    images: [
      {
        url: "/og.jpg",
        width: 1440,
        height: 900,
        alt: "Painel do Encaixe com a agenda do negócio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encaixe · agendamento online para pequenos negócios",
    description:
      "Agendamento online para barbearias, clínicas e estúdios: página pública por link, horários sem conflito e confirmação automática por e-mail.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#16345f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${sora.variable} h-full`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
