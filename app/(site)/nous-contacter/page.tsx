import { FacebookLogo } from "@phosphor-icons/react/dist/ssr";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Contact Vendin-les-Bethune",
  description: "Coordonnees de la mairie et contacts utiles pour Vendin-les-Bethune."
};

export default function NousContacterPage() {
  const faqItems = [
    {
      question: "Comment joindre la mairie de Vendin-les-Bethune ?",
      answer: "Les coordonnees officielles sont indiquees sur cette page."
    },
    {
      question: "Ou suivre l'actualite locale ?",
      answer: "La page Actualites regroupe les informations publiees."
    },
    {
      question: "Comment contacter monvendin.fr ?",
      answer: "Utilisez l'adresse email affichee si besoin."
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
        <PageTitle title="Nous contacter" />
        <p className="text-slate max-w-2xl">
          Retrouvez les coordonnees pour joindre la mairie ou suivre l'actualite locale.
        </p>
      </header>

      <Card className="p-6 space-y-4">
        <h2 className="section-title motion-in">Coordonnees</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-ink">Hotel de ville</p>
            <p className="text-sm text-slate">
              Place du General de Gaulle, 62232 Vendin-les-Bethune
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Coordonnees</p>
            <p className="text-sm text-slate">Tel: 03.21.57.26.21</p>
            <p className="text-sm text-slate">Fax: 03.21.01.00.03</p>
            <a
              href="mailto:mairie.vendinlesbethune@wanadoo.fr"
              className="text-sm text-slate underline underline-offset-4"
            >
              mairie.vendinlesbethune@wanadoo.fr
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100067033293725"
              className="mt-2 block w-fit"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-[0_10px_20px_rgba(24,119,242,0.35)]">
                <FacebookLogo className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </Card>
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
