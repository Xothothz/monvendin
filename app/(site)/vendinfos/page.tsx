import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageTitle } from "@/components/PageTitle";
import { DocumentsAccordion } from "@/components/DocumentsAccordion";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Vendinfos"
};

export const dynamic = "force-dynamic";

export default async function VendinfosPage() {
  let heroImageUrl: string | null = "/images/vendinfos-hero.png";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "vendinfos"
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
    heroImageUrl = "/images/vendinfos-hero.png";
    heroId = null;
  }

  let docs = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "documents",
      depth: 0,
      sort: "-documentDate",
      limit: 20,
      where: {
        documentType: {
          equals: "vendinfos"
        }
      }
    });
    docs = response.docs ?? [];
  } catch {
    docs = [];
  }

  return (
    <div className="space-y-8">
      <HeroAdmin
        slug="vendinfos"
        eyebrow="Vendinfos"
        title="Vendinfos"
        subtitle="Le journal municipal a consulter en ligne."
        alt="Vendinfos"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <header className="space-y-3">
        <PageTitle title="Vendinfos" watermark="Journal local" />
        <p className="text-slate max-w-2xl">
          Consultez les 20 derniers numeros du journal municipal.
        </p>
      </header>

      <DocumentsAccordion
        initialDocuments={docs}
        viewerBasePath="/vendinfos/documents"
        documentTypeFilter="vendinfos"
        forcedDocumentType="vendinfos"
        showPublicYearFilter
      />
    </div>
  );
}
