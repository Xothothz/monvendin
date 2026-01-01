import { PageTitle } from "@/components/PageTitle";
import { RechercheClient } from "./RechercheClient";

export const metadata = {
  title: "Recherche"
};

export default function RecherchePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Recherche interne" />
        <p className="text-slate max-w-2xl">
          Recherche rapide sur les actualites, demarches et documents.
        </p>
      </header>
      <RechercheClient />
    </div>
  );
}
