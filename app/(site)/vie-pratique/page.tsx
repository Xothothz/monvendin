import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Vie pratique Vendin-les-Bethune",
  description: "Services pratiques du quotidien a Vendin-les-Bethune."
};

const items = [
  {
    title: "Police municipale",
    description: "Contact, prevention et operation tranquillite vacances.",
    link: "/vie-pratique/police-municipale"
  },
  {
    title: "Sante",
    description: "Services de sante et professionnels a proximite.",
    link: "/vie-pratique/sante"
  },
  {
    title: "Services",
    description: "Demarches, dechets, urbanisme et reseaux.",
    link: "/vie-pratique/demarches"
  },
  {
    title: "Solidarite",
    description: "CCAS et services pour les seniors.",
    link: "/vie-pratique/ccas"
  },
  {
    title: "Emploi",
    description: "Offres, emploi territorial et formation.",
    link: "/vie-pratique/emploi"
  },
  {
    title: "Logement",
    description: "Bailleurs sociaux, aides et permis de louer.",
    link: "/vie-pratique/logement"
  }
];

export default function ViePratiquePage() {
  const faqItems = [
    {
      question: "Ou trouver les informations sur les dechets ?",
      answer: "La rubrique Dechets regroupe la collecte et le tri selectif."
    },
    {
      question: "Ou consulter l'urbanisme et la voirie ?",
      answer: "Les informations d'urbanisme sont dans la rubrique Urbanisme."
    },
    {
      question: "Ou acceder aux demarches du quotidien ?",
      answer: "La page Demarches centralise les fiches utiles."
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
        <PageTitle title="Vie pratique" />
        <p className="text-slate max-w-2xl">
          Services essentiels du quotidien, presentes de facon claire et actionnable.
        </p>
      </header>
      <div className="card-grid">
        {items.map((item) => (
          <Card key={item.title} className="p-6 flex flex-col gap-3">
            <h3 className="text-lg font-display">{item.title}</h3>
            <p className="text-sm text-slate flex-1">{item.description}</p>
            <Link href={item.link} className="text-sm font-semibold text-ink">
              Explorer
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
