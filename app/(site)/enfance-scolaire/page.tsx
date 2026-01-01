import { PageTitle } from "@/components/PageTitle";
import { ecoles } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export const metadata = {
  title: "Enfance & scolaire"
};

export default function EnfanceScolairePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Enfance & scolaire" />
        <p className="text-slate max-w-2xl">
          Informations pratiques sur les ecoles et la restauration scolaire.
        </p>
      </header>
      <section className="space-y-4">
        <h2 className="section-title">Ecoles</h2>
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
        <h2 className="section-title">Menus de cantine</h2>
        <p className="text-slate">
          Consultez les menus hebdomadaires en version accessible HTML.
        </p>
        <Button href="/menus-cantine" variant="secondary">
          Voir les menus
        </Button>
      </section>
    </div>
  );
}
