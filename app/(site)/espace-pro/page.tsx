import { PageTitle } from "@/components/PageTitle";
import { EspaceProClient } from "./EspaceProClient";

export const metadata = {
  title: "Espace pro Vendin-les-Bethune",
  description: "Espace de publication pour les informations professionnelles locales."
};

export default function EspaceProPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Espace pro" watermark="Edition" />
        <p className="text-slate max-w-2xl">
          Modifiez votre page et publiez les informations utiles.
        </p>
      </header>
      <EspaceProClient />
    </div>
  );
}
