import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Jeunesse"
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
  return (
    <div className="space-y-8 section-stack">
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
    </div>
  );
}
