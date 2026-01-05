import { notFound } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { demarches, getDemarcheBySlug } from "@/lib/data";
import { Badge } from "@/components/Badge";

export const generateStaticParams = () => {
  return demarches.map((item) => ({ slug: item.slug }));
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DemarcheDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getDemarcheBySlug(slug);
  if (!item) return notFound();

  if (slug === "location-salle") {
    return (
      <div className="space-y-8 section-stack">
        <header className="space-y-3">
          <PageTitle title={item.title} />
          <p className="text-slate max-w-2xl">Site en Constuction</p>
        </header>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Badge variant="accent">{item.category}</Badge>
        <PageTitle title={item.title} watermark="Vie pratique" />
        <p className="text-slate">{item.description}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="section-title motion-in">Etapes principales</h2>
          <ol className="list-decimal pl-5 space-y-2 text-slate">
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <h2 className="section-title motion-in">Pieces a fournir</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate">
            {item.documents.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 border border-ink/10">
          <p className="text-xs uppercase text-slate">Delai moyen</p>
          <p className="text-lg font-semibold text-ink">{item.delay}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-ink/10">
          <p className="text-xs uppercase text-slate">Cout</p>
          <p className="text-lg font-semibold text-ink">{item.cost}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-ink/10">
          <p className="text-xs uppercase text-slate">Contact public</p>
          <p className="text-sm text-slate">{item.contact}</p>
        </div>
      </section>

      <section className="text-sm">
        <h2 className="text-lg font-display">Sources</h2>
        <ul className="mt-2 space-y-1 text-slate">
          {item.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
