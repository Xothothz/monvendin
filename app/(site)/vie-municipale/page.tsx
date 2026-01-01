import { PageTitle } from "@/components/PageTitle";
import { documents } from "@/lib/data";
import { Button } from "@/components/Button";
import { VieMunicipaleTabs } from "./VieMunicipaleTabs";

export const metadata = {
  title: "Vie municipale"
};

const municipalDocs = documents.filter((doc) =>
  ["Compte rendu", "Budget", "Arrete"].includes(doc.type)
);

export default function VieMunicipalePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Vie municipale" />
        <p className="text-slate max-w-2xl">
          Conseils municipaux, budgets et arretes consultables en quelques clics.
        </p>
      </header>
      <VieMunicipaleTabs items={municipalDocs} />
      <Button href="/ma-ville/fiscalite" variant="ghost">
        Voir la bibliotheque complete
      </Button>
    </div>
  );
}
