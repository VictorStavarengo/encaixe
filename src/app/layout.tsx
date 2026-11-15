import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
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
    "Página de agendamento pronta para barbearias, clínicas e estúdios: o cliente escolhe o horário e recebe a confirmação por e-mail.",
  openGraph: {
    title: "Encaixe · agendamento online para pequenos negócios",
    description:
      "Agenda online com página pública, confirmação automática por e-mail e painel de gestão.",
    type: "website",
    locale: "pt_BR",
    url: appUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#1f6b52",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
