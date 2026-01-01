import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Vie pratique"
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
  return (
    <div className="space-y-8">
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
    </div>
  );
}
