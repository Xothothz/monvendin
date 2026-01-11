import { PageTitle } from "@/components/PageTitle";
import { demarches } from "@/lib/data";
import { DemarchesExplorer } from "./DemarchesExplorer";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Demarches Vendin-les-Bethune",
  description: "Fiches pratiques et services municipaux de Vendin-les-Bethune."
};

export default function DemarchesPage() {
  const faqItems = [
    {
      question: "Ou trouver une demarche precise ?",
      answer: "Utilisez la recherche et les filtres de cette page."
    },
    {
      question: "Que contient une fiche demarche ?",
      answer: "Pieces a fournir, couts, delais et contacts utiles."
    },
    {
      question: "Ces demarches concernent-elles Vendin-les-Bethune ?",
      answer: "Oui, elles sont selectionnees pour la commune et ses services."
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
        <PageTitle title="Demarches et services" />
        <p className="text-slate max-w-2xl">
          Des fiches pratiques pour orienter les habitants: pieces a fournir, couts, delais et contacts.
        </p>
      </header>
      <DemarchesExplorer items={demarches} />
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
