import { PageTitle } from "@/components/PageTitle";
import { ecoles } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export const metadata = {
  title: "Enfance & scolaire Vendin-les-Bethune",
  description: "Ecoles, restauration scolaire et services enfance a Vendin-les-Bethune."
};

export default function EnfanceScolairePage() {
  const faqItems = [
    {
      question: "Ou trouver les ecoles de la commune ?",
      answer: "La liste ci-dessus regroupe les ecoles et leurs coordonnees."
    },
    {
      question: "Ou consulter les menus de cantine ?",
      answer: "Les menus sont disponibles sur la page Menus de cantine."
    },
    {
      question: "Les informations sont-elles mises a jour ?",
      answer: "Les horaires et services sont actualises quand de nouvelles infos sont publiees."
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
        <PageTitle title="Enfance & scolaire" />
        <p className="text-slate max-w-2xl">
          Informations pratiques sur les ecoles et la restauration scolaire.
        </p>
      </header>
      <section className="space-y-4">
        <h2 className="section-title motion-in">Ecoles</h2>
        <div className="card-grid">
          {ecoles.map((ecole) => (
            <Card key={ecole.id} className="p-6 space-y-2">
              <h3 className="text-lg font-display">{ecole.name}</h3>
              <p className="text-xs uppercase text-slate">{ecole.type}</p>
              <p className="text-sm text-slate">{ecole.address}</p>
              <p className="text-sm text-slate">{ecole.phone}</p>
              <ul className="text-sm text-slate list-disc pl-5">
                {ecole.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="section-title motion-in">Menus de cantine</h2>
        <p className="text-slate">
          Consultez les menus hebdomadaires en version accessible HTML.
        </p>
        <Button href="/menus-cantine" variant="secondary">
          Voir les menus
        </Button>
      </section>
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
