import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Loisirs Vendin-les-Bethune",
  description: "Vie associative, culture et sport a Vendin-les-Bethune."
};

const items = [
  {
    title: "Vie associative",
    description: "Associations A a Z, mode d'emploi et subventions.",
    link: "/loisirs/associations-a-z"
  },
  {
    title: "Culture",
    description: "Mediatheque, ecole de musique, equipements.",
    link: "/loisirs/culture"
  },
  {
    title: "Sport",
    description: "Clubs et equipements de plein air.",
    link: "/loisirs/clubs"
  }
];

export default function LoisirsPage() {
  const faqItems = [
    {
      question: "Ou trouver une association ou un club ?",
      answer: "La rubrique Vie associative regroupe les informations utiles."
    },
    {
      question: "Ou consulter les equipements culturels ?",
      answer: "La rubrique Culture presente les lieux et activites disponibles."
    },
    {
      question: "Ou trouver les clubs sportifs ?",
      answer: "La rubrique Sport centralise les clubs et equipements."
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
        <PageTitle title="Loisirs" />
        <p className="text-slate max-w-2xl">
          Vie associative, culture et sport pour tous.
        </p>
      </header>
      <div className="card-grid">
        {items.map((item) => (
          <Card key={item.title} className="p-6 flex flex-col gap-3">
            <h3 className="text-lg font-display">{item.title}</h3>
            <p className="text-sm text-slate flex-1">{item.description}</p>
            <Link href={item.link} className="text-sm font-semibold text-ink">
              Acceder
            </Link>
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
