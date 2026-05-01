import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { SiteHeader } from "../components/layout/SiteHeader";
import { getOauthProviderFlags } from "../lib/oauthConfig";
import { Providers } from "./providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitMatch — Encontre seu professor de educação física",
  description:
    "Conectamos alunos a profissionais de educação física com inteligência artificial. Ranking personalizado, perfis verificados e primeira consulta gratuita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const oauth = getOauthProviderFlags();

  return (
    <html
      lang="pt-BR"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers oauth={oauth}>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
