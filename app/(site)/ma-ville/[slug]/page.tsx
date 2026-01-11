import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const pages: Record<
  string,
  { title: string; description: string; bullets: string[]; watermark: string }
> = {
  chiffres: {
    title: "Quelques chiffres",
    description: "Repere des principaux indicateurs municipaux et finances publiques.",
    bullets: ["Population", "Budget de fonctionnement", "Investissements", "Fiscalite locale"],
    watermark: "Vendin-les-Bethune"
  },
  fiscalite: {
    title: "Fiscalite et budget",
    description: "Informations sur les taux, deliberations et rapports financiers.",
    bullets: ["Taux d'imposition", "Rapports d'orientation", "Budget annexe"],
    watermark: "Vendin-les-Bethune"
  },
  "plan-quartiers": {
    title: "Plan et quartiers",
    description: "Cartes, quartiers et equipements publics.",
    bullets: ["Plan de la ville", "Quartiers", "Equipements"],
    watermark: "Se reperer"
  },
  marche: {
    title: "Marché de Vendin-lès-Béthune",
    description:
      "Le marché de Vendin-lès-Béthune est un rendez-vous hebdomadaire pour se retrouver et profiter de stands variés.",
    bullets: ["Horaires", "Emplacement", "Stands", "Renseignements"],
    watermark: "Economie"
  },
  "ville-nature": {
    title: "Ville nature",
    description: "Biodiversite, espaces verts et initiatives durables.",
    bullets: ["Ville fleurie", "Biodiversite", "Guides pratiques"],
    watermark: "Ville nature"
  },
  commissions: {
    title: "Commissions",
    description: "Themes et membres des commissions municipales.",
    bullets: ["Finances", "Travaux", "Jeunesse", "Solidarite"],
    watermark: "Vendin-les-Bethune"
  },
  "ordres-du-jour": {
    title: "Ordres du jour",
    description: "Documents preparatoires avant chaque seance.",
    bullets: ["Prochaine seance", "Archives des ODJ"],
    watermark: "Vendin-les-Bethune"
  }
};

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://monvendin.fr").replace(/\/$/, "");

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return {};

  const canonical = `${siteUrl}/ma-ville/${slug}`;
  const imageUrl =
    slug === "marche" ? `${siteUrl}/images/marche-vendin.jpg` : undefined;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      images: imageUrl ? [{ url: imageUrl }] : undefined
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: page.title,
      description: page.description,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}

export default async function MaVilleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return notFound();

  if (slug === "plan-quartiers") {
    return (
      <div className="space-y-4 section-stack">
        <header className="space-y-3">
          <PageTitle title={page.title} watermark={page.watermark} />
          <p className="text-slate">Site en construction.</p>
        </header>
      </div>
    );
  }

  if (slug === "marche") {
    const breadcrumbSchema = {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Ma ville", item: `${siteUrl}/ma-ville` },
        {
          "@type": "ListItem",
          position: 3,
          name: "Marché de Vendin-lès-Béthune",
          item: `${siteUrl}/ma-ville/marche`
        }
      ]
    };
    const eventSchema = {
      "@type": "Event",
      name: "Marché de Vendin-lès-Béthune",
      description:
        "Rendez-vous hebdomadaire pour se retrouver et profiter de stands variés, dans un cadre central et facilement accessible.",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Wednesday",
        startTime: "08:30",
        endTime: "12:30"
      },
      location: {
        "@type": "Place",
        name: "Mairie de Vendin-les-Bethune",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Place du General de Gaulle",
          addressLocality: "Vendin-les-Bethune",
          postalCode: "62232",
          addressCountry: "FR"
        }
      },
      image: [`${siteUrl}/images/marche-vendin.jpg`],
      organizer: {
        "@type": "Organization",
        name: "Mairie de Vendin-les-Bethune"
      }
    };
    const schema = {
      "@context": "https://schema.org",
      "@graph": [eventSchema, breadcrumbSchema]
    };

    return (
      <div className="space-y-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <header className="space-y-3">
          <PageTitle title={page.title} watermark={page.watermark} />
          <p className="text-slate max-w-2xl">
            Le marché de Vendin-lès-Béthune est un rendez-vous hebdomadaire qui permet aux
            habitants de se retrouver et de profiter de stands variés, dans un cadre central et
            facilement accessible.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <section className="space-y-2">
                <h2 className="text-lg font-display text-ink">Horaires</h2>
                <p className="text-sm text-slate">Le marché se tient chaque mercredi matin.</p>
                <p className="text-sm font-semibold text-ink">De 8 h 30 à 12 h 30.</p>
              </section>
              <div className="h-px bg-ink/10" aria-hidden="true" />
              <section className="space-y-2">
                <h2 className="text-lg font-display text-ink">Emplacement</h2>
                <p className="text-sm text-slate">
                  Devant la mairie de Vendin-lès-Béthune, un emplacement central, pratique pour
                  les habitants et facilement identifiable.
                </p>
              </section>
            </Card>

            <Card className="p-6 space-y-6">
              <section className="space-y-2">
                <h2 className="text-lg font-display text-ink">Stands et ambiance</h2>
                <p className="text-sm text-slate">
                  Le marché accueille différents types de commerçants :
                </p>
                <ul className="list-disc pl-5 text-sm text-slate">
                  <li>des stands alimentaires,</li>
                  <li>des produits du quotidien,</li>
                  <li>selon les semaines, des vendeurs occasionnels.</li>
                </ul>
                <p className="text-sm text-slate">
                  L'offre peut varier d'un mercredi à l'autre, ce qui fait aussi l'intérêt du
                  marché.
                </p>
              </section>
              <div className="h-px bg-ink/10" aria-hidden="true" />
              <section className="space-y-2">
                <h2 className="text-lg font-display text-ink">Emplacements</h2>
                <p className="text-sm text-slate">
                  Les emplacements sont gratuits, ce qui favorise la présence de commerçants
                  locaux et occasionnels.
                </p>
              </section>
              <div className="h-px bg-ink/10" aria-hidden="true" />
              <section className="space-y-2">
                <h2 className="text-lg font-display text-ink">Renseignements</h2>
                <p className="text-sm text-slate">
                  Pour toute information complémentaire (participation, organisation,
                  conditions) :
                </p>
                <a href="tel:0321572621" className="text-sm font-semibold text-ink">
                  03 21 57 26 21
                </a>
              </section>
              <div className="h-px bg-ink/10" aria-hidden="true" />
              <section className="space-y-2">
                <h2 className="text-lg font-display text-ink">Bon à savoir</h2>
                <ul className="list-disc pl-5 text-sm text-slate">
                  <li>Le marché est organisé toute l'année, hors circonstances exceptionnelles.</li>
                  <li>Il est recommandé d'arriver tôt pour profiter du choix et de l'ambiance.</li>
                  <li>
                    La page est mise à jour régulièrement afin de garantir des informations
                    fiables.
                  </li>
                </ul>
              </section>
            </Card>
          </div>

          <Card className="p-6 space-y-4 self-start">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <img
                src="/images/marche-vendin.jpg"
                alt="Marché de Vendin-lès-Béthune"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-slate">
              Source de l'image :{" "}
              <a
                href="https://www.lavoixdunord.fr/990256/article/2021-04-25/vendin-les-bethune-la-commune-son-marche-depuis-un-mois-de-nouveaux-producteurs"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-ink/80 hover:text-ink"
              >
                La Voix du Nord
              </a>
              .
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title={page.title} watermark={page.watermark} />
        <p className="text-slate max-w-2xl">{page.description}</p>
      </header>
      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-display text-ink">Points a retenir</h2>
        <ul className="list-disc pl-5 text-sm text-slate">
          {page.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
