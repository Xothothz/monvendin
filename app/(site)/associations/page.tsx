import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";
import { associations } from "@/lib/data";
import { AssociationsList } from "./AssociationsList";

export const metadata = {
  title: "Associations Vendin-les-Bethune",
  description: "Annuaire des associations, clubs et collectifs de Vendin-les-Bethune."
};

export default function AssociationsPage() {
  const faqItems = [
    {
      question: "Ou trouver une association locale ?",
      answer: "L'annuaire regroupe les associations de Vendin-les-Bethune."
    },
    {
      question: "Comment contacter une association ?",
      answer: "Chaque fiche mentionne les coordonnees disponibles."
    },
    {
      question: "L'annuaire est-il mis a jour ?",
      answer: "Les informations sont actualisees quand des mises a jour sont publiees."
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
        <PageTitle title="Associations locales" />
        <p className="text-slate max-w-2xl">
          Un annuaire citoyen des associations, clubs et collectifs locaux.
        </p>
      </header>
      <AssociationsList items={associations} />
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
