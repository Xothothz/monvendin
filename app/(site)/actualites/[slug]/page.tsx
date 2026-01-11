import type { Metadata } from "next";
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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://monvendin.fr").replace(/\/$/, "");

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
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
    if (!item) {
      return {};
    }
    return {
      title: item.title,
      description: item.summary,
      alternates: {
        canonical: `${siteUrl}/actualites/${item.slug}`
      }
    };
  } catch {
    return {};
  }
}

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

  const imageMeta = item.images?.[0];
  const imageUrl =
    imageMeta && typeof imageMeta.image === "object" ? imageMeta.image?.url ?? null : null;
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Actualites", item: `${siteUrl}/actualites` },
      { "@type": "ListItem", position: 3, name: item.title, item: `${siteUrl}/actualites/${item.slug}` }
    ]
  };
  const articleSchema = {
    "@type": "Article",
    headline: item.title,
    datePublished: item.date,
    dateModified: item.date,
    description: item.summary,
    image: imageUrl ? [imageUrl] : undefined,
    mainEntityOfPage: `${siteUrl}/actualites/${item.slug}`,
    author: {
      "@type": "Organization",
      name: "monvendin.fr"
    }
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema]
  };
  const commentUrl = `${siteUrl}/actualites/${item.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ActualiteDetailClient initialItem={item} commentsUrl={commentUrl} />
    </>
  );
}
