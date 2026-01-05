import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { Card } from "@/components/Card";
import { AnnuaireTable } from "@/components/AnnuaireTable";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const pages: Record<string, { title: string; description: string; bullets: string[] }> = {
  "associations-a-z": {
    title: "Les associations de A a Z",
    description: "Annuaire complet des associations locales.",
    bullets: ["Annuaire", "Contacts", "Domaines"]
  },
  "association-mode-emploi": {
    title: "Association : mode d'emploi",
    description: "Guide pour creer ou animer une association.",
    bullets: ["Creation", "Obligations", "Accompagnement"]
  },
  culture: {
    title: "Culture",
    description: "Mediatheque, ecole de musique et equipements culturels.",
    bullets: ["Mediatheque", "Ecole de musique", "Salles culturelles"]
  },
  clubs: {
    title: "Clubs",
    description: "Clubs sportifs et pratiques proposees.",
    bullets: ["Clubs sportifs", "Inscriptions", "Contacts"]
  },
  "equipement-plein-air": {
    title: "Equipement de plein air",
    description: "Terrains et equipements sportifs exterieurs.",
    bullets: ["Terrains", "Acces", "Reglements"]
  }
};

export default async function LoisirsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return notFound();

  if (slug === "associations-a-z") {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "annuaire",
      depth: 0,
      page: 1,
      limit: 10,
      sort: "denomination",
      where: {
        categorie: {
          equals: "association"
        }
      }
    });

    const associationColumns = [
      { key: "sousCategorie", label: "Categorie" },
      { key: "denomination", label: "Association" },
      { key: "nom", label: "Nom" },
      { key: "prenom", label: "Prenom" },
      { key: "adresse", label: "Adresse" },
      { key: "codePostal", label: "CP" },
      { key: "ville", label: "Ville" },
      { key: "telephone", label: "Tel" },
      { key: "mail", label: "Mail" },
      { key: "siteInternet", label: "Site web" }
    ];

    return (
      <div className="space-y-8 section-stack">
        <CenteredPageHeader
          label="Loisirs"
          title="Les associations de A a Z"
          description="Consultez les associations locales et leurs contacts."
        />
        <AnnuaireTable
          initialData={{
            docs: result.docs,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
	    page: result.page ?? 1,
	    limit: result.limit ?? 20

          }}
          columns={associationColumns as any}
          categories={[{ label: "Association", value: "association" }]}
          categoryFilter="association"
          defaultCategory="association"
          defaultSortKey="denomination"
        />
      </div>
    );
  }

  if (slug === "association-mode-emploi") {
    return (
      <div className="space-y-10">
        <CenteredPageHeader
          label="Loisirs"
          title="Association : mode d'emploi"
          description="Les etapes essentielles pour creer, declarer et faire vivre une association."
        />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-display text-ink">Creer une association</h2>
            <p className="text-sm text-slate text-justify">
              Les associations a but non lucratif peuvent naitre librement, sans autorisation ni
              declaration prealable. En revanche, pour exister legalement, solliciter des
              subventions, agir en justice ou acheter/vendre en leur nom, elles doivent etre
              declarees. La declaration rend l'association publique et lui permet de fonctionner
              comme une personne morale constituee.
            </p>
            <div className="space-y-4">
              <div className="rounded-2xl border border-ink/10 bg-fog p-4 space-y-2 text-sm text-slate">
                <h3 className="text-base font-semibold text-ink">Etape 1 : La declaration</h3>
                <p className="text-justify">A transmettre ou deposer a la sous-prefecture de Bethune.</p>
                <p className="font-semibold text-ink">Pieces a joindre :</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Proces-verbal de l'assemblee constitutive.</li>
                  <li>Liste des personnes chargees de l'administration.</li>
                  <li>
                    Un exemplaire des statuts signe par au moins deux personnes figurant parmi les
                    dirigeants.
                  </li>
                  <li>
                    Une enveloppe affranchie (tarif 20 grammes) avec l'adresse de gestion de
                    l'association.
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-2 text-sm text-slate">
                <h3 className="text-base font-semibold text-ink">
                  Etape 2 : Publication au Journal officiel
                </h3>
                <p className="text-justify">
                  Des la reception du recepisse, adressez l'imprime de publication au service
                  prefectoral. Il le transmettra a la direction des Journaux officiels pour
                  parution au Journal Officiel.
                </p>
                <p>
                  Cout forfaitaire : <span className="font-semibold text-ink">44 EUR</span> - delai
                  de parution : un mois.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">En cas de dissolution</h3>
            <p className="text-sm text-slate text-justify">
              La demande doit etre deposee ou envoyee a la sous-prefecture ou l'association est
              enregistree.
            </p>
            <p className="text-sm font-semibold text-ink">Dossier a fournir :</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate">
              <li>Copie du compte-rendu d'assemblee generale actant la dissolution.</li>
              <li>Imprime d'insertion au Journal officiel.</li>
              <li>Ces documents doivent porter la signature d'au moins deux personnes.</li>
            </ul>
            <div className="rounded-2xl border border-ink/10 bg-fog p-4 text-sm text-slate space-y-2">
              <h4 className="text-base font-semibold text-ink">Declarer en ligne</h4>
              <p className="text-justify">
                Le service est disponible 24h/24 et 7j/7 sur service-public.fr.
              </p>
              <p className="text-justify">
                Via "Votre compte association", il est possible de declarer la creation, deposer
                les pieces en ligne, suivre le traitement et recevoir le recepisse
                dematerialise dans votre espace.
              </p>
              <p className="text-justify">
                Vous pouvez egalement demander la publication obligatoire au Journal officiel des
                associations.
              </p>
              <a
                href="https://www.service-public.fr/associations"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
              >
                Acceder au service-public.fr
              </a>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Documents a telecharger</h3>
            <p className="text-sm text-slate text-justify">
              Telechargez les modeles utiles pour constituer votre dossier.
            </p>
            <ul className="space-y-3 text-sm text-slate">
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <span>Creation d'association</span>
                <a
                  href="/docs/creation-association.pdf"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                >
                  Telecharger
                </a>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <span>Modele de statuts</span>
                <a
                  href="/docs/modele-statuts-association.doc"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                >
                  Telecharger
                </a>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <span>Modele de reglement interieur</span>
                <a
                  href="/docs/modele-reglement-interieur.doc"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                >
                  Telecharger
                </a>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <span>Modele de convocation AG constitutive</span>
                <a
                  href="/docs/modele-convocation-ag.doc"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                >
                  Telecharger
                </a>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <span>Modele de proces-verbal AG constitutive</span>
                <a
                  href="/docs/modele-pv-ag.doc"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                >
                  Telecharger
                </a>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    );
  }

  if (slug === "clubs" || slug === "equipement-plein-air" || slug === "culture") {
    return (
      <div className="space-y-4">
        <CenteredPageHeader label="Loisirs" title={page.title} />
        <p className="text-slate">Site en construction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CenteredPageHeader label="Loisirs" title={page.title} description={page.description} />
      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-display text-ink">Acces rapides</h2>
        <ul className="list-disc pl-5 text-sm text-slate">
          {page.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
