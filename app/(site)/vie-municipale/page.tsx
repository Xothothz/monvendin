import { PageTitle } from "@/components/PageTitle";
import { documents } from "@/lib/data";
import { Button } from "@/components/Button";
import { VieMunicipaleTabs } from "./VieMunicipaleTabs";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Vie municipale Vendin-les-Bethune",
  description: "Comptes rendus, budgets et arretes municipaux de Vendin-les-Bethune."
};

const municipalDocs = documents.filter((doc) =>
  ["Compte rendu", "Budget", "Arrete"].includes(doc.type)
);

export default function VieMunicipalePage() {
  const faqItems = [
    {
      question: "Ou consulter les comptes rendus ?",
      answer: "Les comptes rendus sont regroupes par onglet."
    },
    {
      question: "Ou trouver les budgets municipaux ?",
      answer: "Les budgets sont disponibles dans cette rubrique."
    },
    {
      question: "Ou voir l'ensemble des documents officiels ?",
      answer: "La bibliotheque complete est accessible depuis Fiscalite."
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
        <PageTitle title="Vie municipale" />
        <p className="text-slate max-w-2xl">
          Conseils municipaux, budgets et arretes consultables en quelques clics.
        </p>
      </header>
      <VieMunicipaleTabs items={municipalDocs} />
      <Button href="/ma-ville/fiscalite" variant="ghost">
        Voir la bibliotheque complete
      </Button>
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
