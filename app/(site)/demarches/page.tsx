import { PageTitle } from "@/components/PageTitle";
import { demarches } from "@/lib/data";
import { DemarchesExplorer } from "./DemarchesExplorer";

export const metadata = {
  title: "Demarches"
};

export default function DemarchesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Demarches et services" />
        <p className="text-slate max-w-2xl">
          Des fiches pratiques pour orienter les habitants: pieces a fournir, couts, delais et contacts.
        </p>
      </header>
      <DemarchesExplorer items={demarches} />
    </div>
  );
}
