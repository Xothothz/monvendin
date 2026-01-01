import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { Fraunces, Source_Sans_3 } from "next/font/google";

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});
const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Vendin-les-Bethune | Portail citoyen alternatif",
    template: "%s | Portail citoyen alternatif"
  },
  description:
    "Site citoyen independant de Vendin-les-Bethune: services utiles et ressources publiques.",
  openGraph: {
    title: "Vendin-les-Bethune | Portail citoyen alternatif",
    description:
      "Portail de services citoyens, non affilie a la mairie de Vendin-les-Bethune.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
