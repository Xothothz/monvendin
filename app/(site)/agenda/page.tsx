import { getPayload } from "payload";
import configPromise from "@payload-config";
import { AgendaList } from "./AgendaList";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Agenda Vendin-les-Bethune",
  description: "Agenda des evenements et temps forts a Vendin-les-Bethune."
};

export const dynamic = "force-dynamic";

type AgendaEvent = {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  address?: string | null;
  summary?: string | null;
  description?: string | null;
  externalLink?: string | null;
  status?: "draft" | "review" | "published";
  image?: { id?: string; url?: string; alt?: string } | string | null;
  imageUrl?: string | null;
};

export default async function AgendaPage() {
  const payload = await getPayload({ config: configPromise });
  let heroImageUrl: string | null = "/images/agenda-hero.png";
  let heroId: string | null = null;

  try {
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "agenda"
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
    heroImageUrl = "/images/agenda-hero.png";
    heroId = null;
  }

  const { docs: eventDocs } = await payload.find({
    collection: "events",
    depth: 1,
    sort: "startDate",
    limit: 200,
    where: {
      status: {
        equals: "published"
      }
    }
  });

  const events: AgendaEvent[] = (eventDocs as any[]).map((event) => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    startDate: event.startDate,
    endDate: event.endDate ?? null,
    location: event.location ?? null,
    address: event.address ?? null,
    summary: event.summary ?? null,
    description: event.description ?? null,
    externalLink: event.externalLink ?? null,
    status: event.status ?? "published",
    image: event.image ?? null,
    imageUrl: typeof event.image === "object" ? event.image?.url ?? null : null
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vendin-citoyen.fr";

  return (
    <div className="space-y-8 section-stack">
      <HeroAdmin
        slug="agenda"
        eyebrow="Agenda"
        title="Agenda"
        subtitle="Les rendez-vous et temps forts de la commune."
        alt="Agenda municipal"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <CenteredPageHeader
        label="Agenda"
        title="Agenda"
        description="Liste des evenements publics, reunions et rendez-vous locaux."
      />

      <AgendaList events={events} siteUrl={siteUrl} />
    </div>
  );
}
