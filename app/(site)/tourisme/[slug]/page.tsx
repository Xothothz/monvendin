import { notFound } from "next/navigation";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { Card } from "@/components/Card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const pages: Record<string, { title: string; description: string; bullets: string[] }> = {
  balades: {
    title: "Balades",
    description: "Idees de promenades et parcours nature.",
    bullets: ["Parcours urbain", "Boucle nature", "Points de vue"]
  },
  patrimoine: {
    title: "Patrimoine",
    description: "Elements historiques et culturels de la ville.",
    bullets: ["Eglise", "Memoires locales", "Lieux emblematiques"]
  },
  "infos-pratiques": {
    title: "Infos pratiques",
    description: "Acces, stationnement et contacts utiles.",
    bullets: ["Stationnement", "Acces", "Contacts"]
  }
};

export default async function TourismeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return notFound();

  if (slug === "balades" || slug === "patrimoine") {
    return (
      <div className="space-y-4">
        <CenteredPageHeader label="Tourisme" title={page.title} />
        <p className="text-slate">Site en construction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CenteredPageHeader label="Tourisme" title={page.title} description={page.description} />
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
