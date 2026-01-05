import { getPayload } from "payload";
import configPromise from "@payload-config";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HomeBannerHistory } from "@/components/HomeBannerHistory";

export const metadata = {
  title: "Historique des infos"
};

export const dynamic = "force-dynamic";

type BannerItem = {
  id?: string | number;
  label?: string | null;
  message: string;
  status?: "draft" | "published";
  order?: number | null;
  createdAt?: string | null;
};

export default async function InfosPage() {
  let items: BannerItem[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "home-banners",
      depth: 0,
      sort: "-createdAt",
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    items = (response.docs ?? []) as BannerItem[];
  } catch {
    items = [];
  }

  return (
    <div className="section-stack space-y-8">
      <CenteredPageHeader
        label="Infos"
        title="Historique des infos"
        description="Retrouvez l'ensemble des informations publiees sur le bandeau de la page d'accueil."
      />
      <HomeBannerHistory items={items} />
    </div>
  );
}
