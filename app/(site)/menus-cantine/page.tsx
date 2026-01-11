import { PageTitle } from "@/components/PageTitle";
import { menus } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";

export const metadata = {
  title: "Menus de cantine Vendin-les-Bethune",
  description: "Menus scolaires hebdomadaires et allergenes a Vendin-les-Bethune."
};

export default function MenusCantinePage() {
  const faqItems = [
    {
      question: "Ou trouver les menus de cantine ?",
      answer: "Les menus sont listes par semaine sur cette page."
    },
    {
      question: "Existe-t-il une version PDF ?",
      answer: "Un bouton PDF est affiche quand le document est disponible."
    },
    {
      question: "Les allergenes sont-ils indiques ?",
      answer: "Les allergenes sont renseignes quand l'information est disponible."
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
        <PageTitle title="Menus de cantine" />
        <p className="text-slate max-w-2xl">
          Menus accessibles en HTML par semaine. Les allergenes sont indiques quand disponibles.
        </p>
      </header>
      <div className="space-y-6">
        {menus.map((week) => (
          <Card key={week.id} className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="section-title motion-in">Semaine du {week.week}</h2>
              {week.pdf && (
                <Button href={week.pdf} variant="secondary">
                  Version PDF
                </Button>
              )}
            </div>
            <Table>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Menu</th>
                  <th>Allergenes</th>
                </tr>
              </thead>
              <tbody>
                {week.days.map((day) => (
                  <tr key={day.day}>
                    <td className="font-semibold text-ink">{day.day}</td>
                    <td>
                      <ul className="text-sm text-slate space-y-1">
                        {day.lunch.map((dish) => (
                          <li key={dish}>{dish}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {day.allergens ? (
                        <ul className="text-sm text-slate space-y-1">
                          {day.allergens.map((allergen) => (
                            <li key={allergen}>{allergen}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate">Donnees non fournies</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
