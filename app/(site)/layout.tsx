import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import {
  Bebas_Neue,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Source_Sans_3,
  Work_Sans
} from "next/font/google";

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
const cormorantFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap"
});
const workSansFont = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-work",
  display: "swap"
});
const bebasFont = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap"
});
const dmSansFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm",
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
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" }]
  }
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://monvendin.fr/#website",
      name: "monvendin.fr",
      url: "https://monvendin.fr",
      inLanguage: "fr",
      description:
        "Portail citoyen independant de Vendin-les-Bethune: services utiles et ressources publiques."
    },
    {
      "@type": "CityHall",
      "@id": "https://monvendin.fr/#mairie",
      name: "Mairie de Vendin-les-Bethune",
      address: {
        "@type": "PostalAddress",
        streetAddress: "209 rue Francois Mitterand",
        postalCode: "62232",
        addressLocality: "Vendin-lez-Bethune",
        addressCountry: "FR"
      },
      telephone: "03 21 57 26 21",
      email: "mairie.vendinlesbethune@wanadoo.fr"
    }
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${displayFont.variable} ${cormorantFont.variable} ${workSansFont.variable} ${bebasFont.variable} ${dmSansFont.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
