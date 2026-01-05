import { getPayload } from "payload";
import configPromise from "@payload-config";
import { DocumentsAccordion } from "@/components/DocumentsAccordion";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Fiscalite"
};

export const dynamic = "force-dynamic";

export default async function FiscalitePage() {
  let heroImageUrl: string | null = "/images/fiscalite-hero.png";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "fiscalite"
        }
      }
    });
    const heroDoc = heroResponse.docs?.[0] as
      | { id?: string | number; image?: { url?: string } | string | null }
      | undefined;
    if (heroDoc?.image && typeof heroDoc.image === "object" && heroDoc.image.url) {
      heroImageUrl = heroDoc.image.url;
    }
    if (heroDoc?.id) {
      heroId = String(heroDoc.id);
    }
  } catch {
    heroImageUrl = "/images/fiscalite-hero.png";
    heroId = null;
  }

    let docs: unknown[] = [];
      try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "documents",
      depth: 0,
      limit: 200,
      sort: "-documentDate"
    });
    docs = response.docs ?? [];
  } catch {
    docs = [];
  }

  return (
    <div className="space-y-8 section-stack">
      <HeroAdmin
        slug="fiscalite"
        eyebrow="Ma ville"
        title="Fiscalite"
        subtitle="Documents fiscaux et financiers par annee."
        alt="Fiscalite"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <CenteredPageHeader
        label="Fiscalite"
        title="Fiscalite et documents"
        description="Consultez les documents fiscaux et financiers par annee."
      />
      <DocumentsAccordion initialDocuments={docs as any} />
    </div>
  );
}
