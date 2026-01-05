import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ActualitesList } from "./ActualitesList";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Actualites"
};

export const dynamic = "force-dynamic";

type ActualiteItem = {
  id: string | number;
  title: string;
  slug: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  sources: { label: string; url: string }[];
  images?: {
    image?: { id?: string; url?: string; alt?: string } | string | null;
    alt?: string | null;
  }[];
  attachments?: {
    file?: { id?: string; url?: string; filename?: string } | string | null;
    label?: string | null;
  }[];
  status?: "draft" | "review" | "published";
};

export default async function ActualitesPage() {
  let heroImageUrl: string | null = "/images/actualites-hero.png";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "actualites"
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
    heroImageUrl = "/images/actualites-hero.png";
    heroId = null;
  }

  let docs: ActualiteItem[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "actualites",
      depth: 1,
      sort: "-date",
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    docs = (response.docs ?? []) as ActualiteItem[];
  } catch {
    docs = [];
  }

  const items = docs;

  return (
    <div className="space-y-8 section-stack">
      <HeroAdmin
        slug="actualites"
        eyebrow="Actualites"
        title="Actualites locales"
        subtitle="Les informations et initiatives qui animent Vendin-les-Bethune."
        alt="Actualites municipales"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <CenteredPageHeader
        label="Actualites"
        title="Actualites locales"
        description="Liste des informations citoyennes et mises a jour locales issues de sources publiques."
      />
      <ActualitesList items={items} allowEdit />
    </div>
  );
}
