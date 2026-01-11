import Link from "next/link";
import {
  CalendarBlank,
  ClipboardText,
  EnvelopeSimple,
  MapPinLine,
  Newspaper,
  PhoneCall,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/Card";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const metadata = {
  title: "Vendin-les-Bethune",
  description: "Page pratique pour Vendin-les-Bethune: services, contacts et infos locales."
};

export default function VendinLesBethunePage() {
  const quickLinks = [
    { label: "Actualites locales", href: "/actualites", icon: Newspaper, tone: "accent" },
    { label: "Agenda municipal", href: "/agenda", icon: CalendarBlank, tone: "warning" },
    { label: "Vie pratique", href: "/vie-pratique", icon: MapPinLine, tone: "gold" },
    { label: "Demarches", href: "/demarches", icon: ClipboardText, tone: "accent" },
    { label: "Infos municipales", href: "/infos", icon: UsersThree, tone: "neutral" },
    { label: "Nous contacter", href: "/nous-contacter", icon: PhoneCall, tone: "neutral" }
  ] as const;
  const faqItems = [
    {
      question: "Ou consulter les actualites locales a Vendin-les-Bethune ?",
      answer:
        "La page Actualites regroupe les informations publiees sur Vendin-les-Bethune."
    },
    {
      question: "Ou trouver l'agenda des evenements a Vendin-les-Bethune ?",
      answer: "L'agenda municipal rassemble les rendez-vous et evenements a venir."
    },
    {
      question: "Ou acceder aux services et demarches en ligne ?",
      answer:
        "Les rubriques Vie pratique et Demarches centralisent les informations utiles."
    }
  ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div className="space-y-12 section-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CenteredPageHeader
        label="Commune"
        title="Vendin-l&#232;s-B&#233;thune"
        description="Page pratique pour retrouver les services, contacts et informations utiles de Vendin-l&#232;s-B&#233;thune (Pas-de-Calais, 62)."
      />

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="relative overflow-hidden p-6">
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-white to-gold/20"
            aria-hidden="true"
          />
          <div className="relative space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
              Commune du Pas-de-Calais
            </p>
            <h2 className="text-2xl font-display text-ink">
              Vendin-l&#232;s-B&#233;thune, portail local et services citoyens
            </h2>
            <p className="text-sm text-slate leading-relaxed">
              Vendin-l&#232;s-B&#233;thune est une commune du Pas-de-Calais (62), situee dans
              l'agglomeration de Bethune-Bruay. Cette page centralise les liens utiles vers
              les actualites, l'agenda, la vie pratique et les services municipaux.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/60">
              <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1">
                Hauts-de-France
              </span>
              <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1">
                Agglomeration Bethune-Bruay
              </span>
              <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1">
                Code postal 62232
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">
              <Link href="/ma-ville" className="no-link-underline hover:text-ink">
                Ma ville
              </Link>
              <Link href="/ma-ville/histoire" className="no-link-underline hover:text-ink">
                Histoire
              </Link>
              <Link href="/a-propos" className="no-link-underline hover:text-ink">
                A propos
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 border-l-4 border-accent/40">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
              Mairie de Vendin-l&#232;s-B&#233;thune
            </p>
            <p className="text-lg font-display text-ink">Contact direct</p>
          </div>
          <div className="space-y-3 text-sm text-slate">
            <p className="flex items-start gap-2">
              <MapPinLine className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
              <span>
                209 rue Francois Mitterand
                <span className="block">62232 Vendin-lez-Bethune</span>
              </span>
            </p>
            <a href="tel:0321572621" className="flex items-center gap-2 text-ink no-link-underline">
              <PhoneCall className="h-4 w-4 text-accent" aria-hidden="true" />
              03 21 57 26 21
            </a>
            <a
              href="mailto:mairie.vendinlesbethune@wanadoo.fr"
              className="flex items-center gap-2 text-ink no-link-underline"
            >
              <EnvelopeSimple className="h-4 w-4 text-accent" aria-hidden="true" />
              mairie.vendinlesbethune@wanadoo.fr
            </a>
            <a
              href="https://www.google.com/maps?q=209+Rue+Francois+Mitterand+62232+Vendin-lez-Bethune"
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-accent no-link-underline"
            >
              Voir sur la carte
            </a>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-display text-ink">Acces rapides</h2>
          <Link href="/structure-du-site" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent no-link-underline">
            Structure du site
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="no-link-underline">
                <Card className="flex items-center gap-3 p-5 text-sm font-semibold text-ink hover:border-gold/40">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${
                      item.tone === "accent"
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : item.tone === "warning"
                        ? "border-warning/30 bg-warning/10 text-warning"
                        : item.tone === "gold"
                        ? "border-gold/30 bg-gold/10 text-gold"
                        : "border-ink/10 bg-white/60 text-ink/60"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-display text-ink">Services clefs</h2>
          <ul className="space-y-2 text-sm text-slate">
            <li>
              <Link href="/vie-pratique/dechets" className="no-link-underline">
                Collecte des dechets et tri selectif
              </Link>
            </li>
            <li>
              <Link href="/vie-pratique/urbanisme" className="no-link-underline">
                Urbanisme et voirie
              </Link>
            </li>
            <li>
              <Link href="/jeunesse/accueil-periscolaire" className="no-link-underline">
                Accueil periscolaire
              </Link>
            </li>
            <li>
              <Link href="/loisirs/associations-a-z" className="no-link-underline">
                Associations locales
              </Link>
            </li>
          </ul>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-display text-ink">Informations utiles</h2>
          <ul className="space-y-2 text-sm text-slate">
            <li>
              <Link href="/horaires-des-services" className="no-link-underline">
                Horaires des services municipaux
              </Link>
            </li>
            <li>
              <Link href="/ma-ville/conseil-municipal" className="no-link-underline">
                Conseil municipal
              </Link>
            </li>
            <li>
              <Link href="/ma-ville/delegues-quartier" className="no-link-underline">
                Delegues de quartier
              </Link>
            </li>
            <li>
              <Link href="/structure-du-site" className="no-link-underline">
                Structure du site
              </Link>
            </li>
          </ul>
        </Card>
      </section>

      <Card className="p-5">
        <details className="variantes-orthographe">
          <summary>Orthographes et recherches frequentes</summary>
          <p>
            Recherches frequentes : <strong>Vendin-l&#232;s-B&#233;thune</strong>,{" "}
            <strong>Vendin-lez-B&#233;thune</strong>, <strong>vendin les bethune</strong>,{" "}
            <strong>vendin les b&#233;thune</strong>.
          </p>
        </details>
      </Card>

      <Card className="p-5">
        <details className="variantes-orthographe">
          <summary>Questions frequentes</summary>
          <div className="space-y-2 text-sm text-slate">
            <p>
              <strong>Ou consulter les actualites locales ?</strong> La page{" "}
              <Link href="/actualites" className="no-link-underline font-semibold text-accent">
                Actualites
              </Link>{" "}
              regroupe les informations publiees sur Vendin-les-Bethune.
            </p>
            <p>
              <strong>Ou trouver l'agenda municipal ?</strong> L&apos;
              <Link href="/agenda" className="no-link-underline font-semibold text-accent">
                agenda municipal
              </Link>{" "}
              rassemble les rendez-vous et evenements a venir.
            </p>
            <p>
              <strong>Ou acceder aux services et demarches ?</strong> Les rubriques{" "}
              <Link href="/vie-pratique" className="no-link-underline font-semibold text-accent">
                Vie pratique
              </Link>{" "}
              et{" "}
              <Link href="/demarches" className="no-link-underline font-semibold text-accent">
                Demarches
              </Link>{" "}
              centralisent les informations utiles.
            </p>
          </div>
        </details>
      </Card>
    </div>
  );
}
