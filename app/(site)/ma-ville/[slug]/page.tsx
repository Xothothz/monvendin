import { notFound } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const pages: Record<
  string,
  { title: string; description: string; bullets: string[]; watermark: string }
> = {
  chiffres: {
    title: "Quelques chiffres",
    description: "Repere des principaux indicateurs municipaux et finances publiques.",
    bullets: ["Population", "Budget de fonctionnement", "Investissements", "Fiscalite locale"],
    watermark: "Vendin-les-Bethune"
  },
  fiscalite: {
    title: "Fiscalite et budget",
    description: "Informations sur les taux, deliberations et rapports financiers.",
    bullets: ["Taux d'imposition", "Rapports d'orientation", "Budget annexe"],
    watermark: "Vendin-les-Bethune"
  },
  "plan-quartiers": {
    title: "Plan et quartiers",
    description: "Cartes, quartiers et equipements publics.",
    bullets: ["Plan de la ville", "Quartiers", "Equipements"],
    watermark: "Se reperer"
  },
  marche: {
    title: "Marche",
    description: "Informations sur le marche hebdomadaire.",
    bullets: ["Horaires", "Emplacement", "Reglement"],
    watermark: "Economie"
  },
  "ville-nature": {
    title: "Ville nature",
    description: "Biodiversite, espaces verts et initiatives durables.",
    bullets: ["Ville fleurie", "Biodiversite", "Guides pratiques"],
    watermark: "Ville nature"
  },
  commissions: {
    title: "Commissions",
    description: "Themes et membres des commissions municipales.",
    bullets: ["Finances", "Travaux", "Jeunesse", "Solidarite"],
    watermark: "Vendin-les-Bethune"
  },
  "ordres-du-jour": {
    title: "Ordres du jour",
    description: "Documents preparatoires avant chaque seance.",
    bullets: ["Prochaine seance", "Archives des ODJ"],
    watermark: "Vendin-les-Bethune"
  }
};

export default async function MaVilleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return notFound();

  if (slug === "plan-quartiers") {
    return (
      <div className="space-y-4 section-stack">
        <header className="space-y-3">
          <PageTitle title={page.title} watermark={page.watermark} />
          <p className="text-slate">Site en construction.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title={page.title} watermark={page.watermark} />
        <p className="text-slate max-w-2xl">{page.description}</p>
      </header>
      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-display text-ink">Points a retenir</h2>
        <ul className="list-disc pl-5 text-sm text-slate">
          {page.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
