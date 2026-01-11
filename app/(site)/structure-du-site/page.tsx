import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";
import { siteNav } from "@/lib/site-nav";

export const metadata = {
  title: "Structure du site monvendin.fr",
  description: "Plan de site et navigation des rubriques de monvendin.fr."
};

export default function StructureDuSitePage() {
  const filteredNav = siteNav
    .map((item) => ({
      ...item,
      sections: item.sections
        .map((section) => ({
          ...section,
          links: section.links.filter((link) => !link.adminOnly)
        }))
        .filter((section) => section.links.length > 0)
    }))
    .filter((item) => item.sections.length > 0);

  const faqItems = [
    {
      question: "Ou trouver une rubrique precise ?",
      answer: "Utilisez la structure pour acceder rapidement aux pages."
    },
    {
      question: "Cette page remplace le menu ?",
      answer: "Elle complete la navigation avec une vue d'ensemble."
    },
    {
      question: "Les liens administrateurs sont-ils affiches ?",
      answer: "Non, seuls les liens publics sont listes."
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
    <div className="space-y-8 section-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="space-y-3">
        <PageTitle title="Structure du site" watermark="Navigation" />
        <p className="text-slate max-w-2xl">
          Retrouvez l'ensemble des rubriques et sous-rubriques du site.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredNav.map((menu) => (
          <Card key={menu.href} className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-display text-ink">{menu.label}</h2>
              <Link href={menu.href} className="text-xs font-semibold text-accent">
                Voir la page
              </Link>
            </div>
            <div className="space-y-4">
              {menu.sections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">
                    {section.title}
                  </p>
                  <ul className="space-y-1 text-sm text-ink/80">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target={link.newTab ? "_blank" : undefined}
                            rel={link.newTab ? "noreferrer" : undefined}
                            className="block rounded-lg px-2 py-1 hover:bg-goldSoft/70"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="block rounded-lg px-2 py-1 hover:bg-goldSoft/70"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <details className="variantes-orthographe">
          <summary>Questions frequentes</summary>
          <div className="space-y-2 text-sm text-slate">
            {faqItems.map((item) => (
              <p key={item.question}>
                <strong>{item.question}</strong> {item.answer}
              </p>
            ))}
          </div>
        </details>
      </Card>
    </div>
  );
}
