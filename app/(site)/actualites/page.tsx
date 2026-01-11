import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ActualitesList } from "./ActualitesList";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HeroAdmin } from "@/components/HeroAdmin";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Actualites Vendin-les-Bethune",
  description: "Actualites locales et informations municipales a Vendin-les-Bethune."
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
  const faqItems = [
    {
      question: "Ou consulter les actualites de Vendin-les-Bethune ?",
      answer: "La page Actualites rassemble les articles publies pour la commune."
    },
    {
      question: "Comment trier les actualites ?",
      answer: "Utilisez le tri par date et les filtres de periode."
    },
    {
      question: "Les articles restent-ils accessibles ?",
      answer: "Les actualites restent disponibles en ligne pour consultation."
    }
  ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div className="space-y-8 section-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
        description={
          <>
            Liste des informations citoyennes et mises a jour locales issues de sources publiques.
            {" "}
            <Link
              href="/vendin-les-bethune"
              className="no-link-underline font-semibold text-accent"
            >
              Vendin-les-Bethune
            </Link>
            .
          </>
        }
      />
      <ActualitesList items={items} allowEdit />
      <Card className="p-5">
        <details className="variantes-orthographe">
          <summary>Questions frequentes</summary>
          <div className="space-y-2 text-sm text-slate">
            {faqItems.map((item) => (
              <p key={item.question}>
                <strong>{item.question}</strong> {item.answer}
              </p>
            ))}
          </div>
        </details>
      </Card>
    </div>
  );
}
