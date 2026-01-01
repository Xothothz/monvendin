import { PageTitle } from "@/components/PageTitle";

export const metadata = {
  title: "Credits et mentions legales"
};

export default function CreditsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Credits et mentions legales" />
        <p className="text-slate max-w-2xl">
          Informations legales, RGPD et accessibilite du portail citoyen.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-display">Editeur du site</h2>
        <p className="text-sm text-slate">
          Portail citoyen non officiel de Vendin-les-Bethune. Ce site est une initiative
          independante a vocation informative.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display">Hebergement</h2>
        <p className="text-sm text-slate">
          OVHcloud - 2 rue Kellermann, 59100 Roubaix, France.
        </p>
      </section>

      <section id="rgpd" className="space-y-4">
        <h2 className="text-xl font-display">Donnees personnelles (RGPD)</h2>
        <p className="text-sm text-slate">
          Les donnees transmises via le formulaire de contact sont utilisees uniquement pour
          repondre a votre demande. Vous pouvez demander la suppression de vos donnees en ecrivant
          a contact@vendin-citoyen.fr.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display">Accessibilite</h2>
        <p className="text-sm text-slate">
          L'objectif est de respecter les bonnes pratiques d'accessibilite (navigation clavier,
          contrastes suffisants, textes alternatifs).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display">Credits</h2>
        <p className="text-sm text-slate">
          Creation Service Communication - version de demonstration.
        </p>
      </section>
    </div>
  );
}
