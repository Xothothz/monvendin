import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ProPageRenderer } from "@/components/pro/ProPageRenderer";

type PageProps = {
  params: Promise<{ slug: string; page: string }>;
};

const pageMap = {
  services: "services",
  galerie: "gallery",
  equipe: "team",
  contact: "contact"
} as const;

export default async function ProSubPage({ params }: PageProps) {
  const { slug, page } = await params;
  const pageKey = pageMap[page as keyof typeof pageMap];
  if (!pageKey) {
    return notFound();
  }

  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "pro-pages",
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug
      }
    }
  });

  const site = result.docs?.[0];
  if (!site) {
    return notFound();
  }

  return <ProPageRenderer site={site as any} pageKey={pageKey} />;
}
