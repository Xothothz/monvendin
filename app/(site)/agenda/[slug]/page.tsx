import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { renderMarkdown } from "@/lib/markdown";
import { LightboxImage } from "@/components/LightboxImage";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(value)
  );

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://monvendin.fr").replace(/\/$/, "");

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: "events",
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
    const event = docs?.[0];
    if (!event) {
      return {};
    }
    return {
      title: event.title,
      description: event.summary,
      alternates: {
        canonical: `${siteUrl}/agenda/${event.slug}`
      }
    };
  } catch {
    return {};
  }
}

export default async function AgendaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "events",
    depth: 2,
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

  const event = docs?.[0];
  if (!event) return notFound();

  const image = typeof event.image === "object" ? event.image : null;
  const startLabel = formatDateTime(event.startDate);
  const endLabel = event.endDate ? formatDateTime(event.endDate) : null;
  const locationName = event.location || "Vendin-les-Bethune";
  const eventSchema = {
    "@type": "Event",
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate ?? event.startDate,
    description: event.summary,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address ?? undefined,
        addressLocality: "Vendin-lez-Bethune",
        postalCode: "62232",
        addressCountry: "FR"
      }
    },
    image: image?.url ? [image.url] : undefined,
    organizer: {
      "@type": "Organization",
      name: "monvendin.fr"
    }
  };
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Agenda", item: `${siteUrl}/agenda` },
      { "@type": "ListItem", position: 3, name: event.title, item: `${siteUrl}/agenda/${event.slug}` }
    ]
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [eventSchema, breadcrumbSchema]
  };

  return (
    <div className="space-y-8 section-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
        <div className="space-y-6">
          <CenteredPageHeader
            label="Agenda"
            title={event.title}
            description={`${endLabel ? `Du ${startLabel} au ${endLabel}` : startLabel}${
              event.location ? ` - ${event.location}` : ""
            }`}
          />
          {event.address && <p className="text-sm text-slate">{event.address}</p>}
          <section className="space-y-4 text-slate">
            {event.summary && <p className="text-base text-ink">{event.summary}</p>}
            {event.description ? (
              <article
                className="space-y-4 text-slate"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }}
              />
            ) : null}
          </section>
          {event.externalLink ? (
            <Link
              href={event.externalLink}
              className="text-sm font-semibold"
              target="_blank"
              rel="noreferrer"
            >
              Consulter la source officielle
            </Link>
          ) : null}
        </div>
        {image?.url ? (
          <aside className="rounded-xl border border-ink/10 bg-white p-4 shadow-card space-y-3">
            <p className="text-xs uppercase tracking-widest text-slate">Visuel</p>
            <LightboxImage
              src={image.url}
              alt={image.alt ?? event.title}
              previewClassName="h-56 w-full rounded-xl border border-ink/10 bg-sand object-contain transition duration-200 hover:scale-[1.02] lg:h-64"
            />
            <p className="text-xs text-slate">Cliquez sur l'image pour l'agrandir.</p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
