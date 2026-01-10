import { getPayload } from "payload";
import configPromise from "@payload-config";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HomeBannerHistory } from "@/components/HomeBannerHistory";

export const metadata = {
  title: "Infos Vendin-les-Bethune",
  description: "Historique des informations locales publiees pour Vendin-les-Bethune."
};

export const dynamic = "force-dynamic";

type BannerItem = {
  id?: string | number;
  label?: string | null;
  message: string;
  status?: "draft" | "published";
  order?: number | null;
  postedAt?: string | null;
  link?: string | null;
  createdAt?: string | null;
};

export default async function InfosPage() {
  let items: BannerItem[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "home-banners",
      depth: 0,
      sort: "-postedAt",
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    items = (response.docs ?? []) as BannerItem[];
    items = items.sort((a, b) => {
      const dateA = new Date(a.postedAt ?? a.createdAt ?? 0).getTime();
      const dateB = new Date(b.postedAt ?? b.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  } catch {
    items = [];
  }

  return (
    <div className="section-stack space-y-8">
      <CenteredPageHeader
        label="Infos"
        title="Historique des infos"
        description="Retrouvez l'ensemble des informations publiees sur le carrousel de la page d'accueil."
      />
      <HomeBannerHistory items={items} />
    </div>
  );
}
