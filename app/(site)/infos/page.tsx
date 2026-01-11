import { getPayload } from "payload";
import configPromise from "@payload-config";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HomeBannerHistory } from "@/components/HomeBannerHistory";
import { Card } from "@/components/Card";

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
  const faqItems = [
    {
      question: "A quoi sert l'historique des infos ?",
      answer: "Il regroupe les messages publies dans le carrousel d'accueil."
    },
    {
      question: "Comment sont classees les infos ?",
      answer: "Par date de publication, de la plus recente a la plus ancienne."
    },
    {
      question: "Les infos avec lien externe restent-elles visibles ?",
      answer: "Oui, elles restent dans l'historique."
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
    <div className="section-stack space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CenteredPageHeader
        label="Infos"
        title="Historique des infos"
        description="Retrouvez l'ensemble des informations publiees sur le carrousel de la page d'accueil."
      />
      <HomeBannerHistory items={items} />
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
