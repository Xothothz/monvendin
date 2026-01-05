import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageTitle } from "@/components/PageTitle";
import { CompteRendusClient } from "./CompteRendusClient";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Comptes rendus"
};

export const dynamic = "force-dynamic";

type ReportDoc = { url?: string; filename?: string } | string | null;

type CouncilReport = {
  id: string;
  date: string;
  agendaDoc?: ReportDoc;
  minutesDoc?: ReportDoc;
  status?: "draft" | "published";
};

export default async function ComptesRendusPage() {
  let heroImageUrl: string | null = "/images/comptes-rendus-hero.png";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "comptes-rendus"
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
    heroImageUrl = "/images/comptes-rendus-hero.png";
    heroId = null;
  }

  let docs: CouncilReport[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "council-reports",
      depth: 1,
      sort: "-date",
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    docs = response.docs as CouncilReport[];
  } catch {
    docs = [];
  }

  const reports = docs.map((item) => ({
    ...item,
    agendaDoc: typeof item.agendaDoc === "object" ? item.agendaDoc : null,
    minutesDoc: typeof item.minutesDoc === "object" ? item.minutesDoc : null
  }));

  return (
    <div className="space-y-8 section-stack">
      <HeroAdmin
        slug="comptes-rendus"
        eyebrow="Ma ville"
        title="Comptes rendus"
        subtitle="Ordres du jour, comptes rendus et deliberations."
        alt="Comptes rendus"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <header className="space-y-3">
        <PageTitle title="Comptes rendus" watermark="Vendin-les-Bethune" />
        <p className="text-slate max-w-2xl">
          Ordres du jour, comptes rendus et deliberations par date.
        </p>
      </header>

      <CompteRendusClient initialReports={reports} />
    </div>
  );
}
