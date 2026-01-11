import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Jeunesse Vendin-les-Bethune",
  description: "Services jeunesse, periscolaire et ecoles a Vendin-les-Bethune."
};

const items = [
  {
    title: "Petite enfance",
    description: "Micro-creche et accompagnement des tout-petits.",
    link: "/jeunesse/micro-creche"
  },
  {
    title: "Periscolaire",
    description: "Restaurant scolaire, accueil peri et My Perischool.",
    link: "/jeunesse/restaurant-scolaire"
  },
  {
    title: "Vie scolaire",
    description: "Ecoles, RASED et accompagnement des eleves.",
    link: "/jeunesse/ecole-maternelle"
  }
];

export default function JeunessePage() {
  const faqItems = [
    {
      question: "Ou trouver l'accueil periscolaire ?",
      answer: "La rubrique Periscolaire regroupe les infos utiles."
    },
    {
      question: "Ou consulter les services petite enfance ?",
      answer: "La rubrique Petite enfance presente la micro-creche."
    },
    {
      question: "Ou trouver les informations sur les ecoles ?",
      answer: "La rubrique Vie scolaire liste les informations principales."
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
        <PageTitle title="Jeunesse" />
        <p className="text-slate max-w-2xl">
          Services pour la petite enfance, le periscolaire et la vie scolaire.
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
