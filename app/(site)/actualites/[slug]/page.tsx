import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ActualiteDetailClient } from "./ActualiteDetailClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

export default async function ActuDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const response = await payload.find({
    collection: "actualites",
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug
      },
      status: {
        equals: "published"
      }
    }
  });

  const item = (response.docs?.[0] as ActualiteItem) ?? null;
  if (!item) return notFound();

  return <ActualiteDetailClient initialItem={item} />;
}
