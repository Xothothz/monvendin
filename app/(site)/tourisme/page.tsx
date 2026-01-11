import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Tourisme Vendin-les-Bethune",
  description: "Patrimoine et decouvertes locales a Vendin-les-Bethune."
};

export default function TourismePage() {
  const faqItems = [
    {
      question: "Ou decouvrir le patrimoine local ?",
      answer: "Cette page regroupera les lieux et parcours a visiter."
    },
    {
      question: "Quand les informations tourisme seront-elles disponibles ?",
      answer: "La rubrique est en cours de construction."
    },
    {
      question: "Ou trouver des informations locales en attendant ?",
      answer: "Consultez la page Vendin-les-Bethune pour les liens utiles."
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
    <div className="space-y-4 section-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CenteredPageHeader
        label="Tourisme"
        title="Tourisme"
        description="Decouvrir la ville, ses parcours et son patrimoine."
      />
      <p className="text-slate">Site en construction.</p>
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
