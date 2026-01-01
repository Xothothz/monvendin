import { notFound } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { associations, getAssociationBySlug } from "@/lib/data";

export const generateStaticParams = () => {
  return associations.map((item) => ({ slug: item.slug }));
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AssociationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getAssociationBySlug(slug);
  if (!item) return notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase text-slate">{item.category}</p>
        <PageTitle title={item.name} watermark="Loisirs" />
        <p className="text-slate max-w-2xl">{item.description}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 border border-ink/10">
          <p className="text-xs uppercase text-slate">Contact public</p>
          <p className="text-sm text-slate">{item.contact}</p>
        </div>
        <div className="rounded-xl bg-white p-5 border border-ink/10">
          <p className="text-xs uppercase text-slate">Site web</p>
          {item.website ? (
            <a href={item.website} target="_blank" rel="noreferrer">
              {item.website}
            </a>
          ) : (
            <p className="text-sm text-slate">Non renseigne</p>
          )}
        </div>
      </section>
    </div>
  );
}
