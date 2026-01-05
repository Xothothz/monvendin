import { PageTitle } from "@/components/PageTitle";
import { associations } from "@/lib/data";
import { AssociationsList } from "./AssociationsList";

export const metadata = {
  title: "Associations"
};

export default function AssociationsPage() {
  return (
    <div className="space-y-8 section-stack">
      <header className="space-y-3">
        <PageTitle title="Associations locales" />
        <p className="text-slate max-w-2xl">
          Un annuaire citoyen des associations, clubs et collectifs locaux.
        </p>
      </header>
      <AssociationsList items={associations} />
    </div>
  );
}
