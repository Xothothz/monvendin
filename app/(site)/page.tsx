import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  ClipboardText,
  FileText,
  HandHeart,
  MapPinLine,
  Recycle,
  ShieldCheck,
  Users
} from "@phosphor-icons/react/dist/ssr";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Card } from "@/components/Card";
import { DecorativeIcon, DecorativeIconName } from "@/components/DecorativeIcon";
import homeBanner from "@/data/home-banner.json";
import { HomeBanner } from "@/components/HomeBanner";
import homeHero from "@/data/home-hero.json";
import { HeroAdmin } from "@/components/HeroAdmin";

export const dynamic = "force-dynamic";

const infoLinks = [
  { label: "Travaux rue de l'Eglise - circulation adaptee", href: "/actualites" },
  { label: "Fermeture exceptionnelle de la mairie le 15/10", href: "/actualites" },
  { label: "Enquete publique: plan local d'urbanisme", href: "/vie-pratique/urbanisme" },
  { label: "Collecte des dechets: calendrier automne", href: "/vie-pratique/dechets" }
];

const quickTiles = [
  {
    label: "Demarches administratives",
    href: "/vie-pratique/demarches",
    icon: ClipboardText,
    decorativeIcon: "demarches" as DecorativeIconName
  },
  {
    label: "Urbanisme",
    href: "/vie-pratique/urbanisme",
    icon: MapPinLine,
    decorativeIcon: "urbanisme" as DecorativeIconName
  },
  {
    label: "Dechets",
    href: "/vie-pratique/dechets",
    icon: Recycle,
    decorativeIcon: "dechets" as DecorativeIconName
  },
  {
    label: "Logement",
    href: "/vie-pratique/logement",
    icon: FileText,
    decorativeIcon: "logement" as DecorativeIconName
  },
  {
    label: "Solidarite",
    href: "/vie-pratique/ccas",
    icon: HandHeart,
    decorativeIcon: "solidarite" as DecorativeIconName
  },
  {
    label: "Securite",
    href: "/vie-pratique/police-municipale",
    icon: ShieldCheck,
    decorativeIcon: "securite" as DecorativeIconName
  },
  {
    label: "Associations",
    href: "/loisirs/associations",
    icon: Users,
    decorativeIcon: "associations" as DecorativeIconName
  },
  {
    label: "Agenda",
    href: "/agenda",
    icon: CalendarBlank,
    decorativeIcon: "agenda" as DecorativeIconName
  }
];

const municipalCards = [
  {
    title: "Liste des elus",
    description: "Composition du conseil municipal et delegations.",
    href: "/ma-ville/elu-et-delegations"
  },
  {
    title: "Conseil municipal",
    description: "Ordres du jour, deliberations et comptes rendus.",
    href: "/ma-ville/conseil-municipal"
  },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value));

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value));

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });
  let bannerItems = homeBanner.items;
  let news: Array<{
    id: string | number;
    title: string;
    slug: string;
    date: string;
    summary?: string | null;
    images?: Array<{
      image?: { url?: string | null; alt?: string | null } | string | null;
      alt?: string | null;
    }>;
  }> = [];
  const now = new Date();
  const nowIso = now.toISOString();
  try {
    const bannerResponse = await payload.find({
      collection: "home-banners",
      depth: 0,
      sort: "order",
      limit: 50,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    const bannerDocs = (bannerResponse.docs ?? []) as Array<{
      id: string | number;
      label?: string | null;
      message: string;
    }>;
    if (bannerDocs.length > 0) {
      bannerItems = bannerDocs.map((doc) => ({
        label: doc.label ?? undefined,
        message: doc.message
      }));
    }
  } catch {
    bannerItems = homeBanner.items;
  }
  const { docs } = await payload.find({
    collection: "events",
    depth: 1,
    limit: 3,
    sort: "startDate",
    where: {
      status: {
        equals: "published"
      },
      or: [
        {
          startDate: {
            greater_than_equal: nowIso
          }
        },
        {
          endDate: {
            greater_than_equal: nowIso
          }
        }
      ]
    }
  });

  const upcomingEvents = (docs as any[])
    .filter((event) => {
      const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
      return endDate >= now;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  try {
    const newsResponse = await payload.find({
      collection: "actualites",
      depth: 1,
      sort: "-date",
      limit: 3,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    if (newsResponse.docs?.length) {
      news = newsResponse.docs as typeof news;
    }
  } catch {
    news = [];
  }

  let heroImageUrl: string | null = homeHero.image ?? null;
  let heroId: string | null = null;

  try {
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "home"
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
    heroImageUrl = homeHero.image ?? null;
    heroId = null;
  }

  return (
    <div className="space-y-10">
      {homeHero.enabled ? (
        <HeroAdmin
          slug="home"
          eyebrow={homeHero.eyebrow}
          title={homeHero.title}
          subtitle={homeHero.subtitle}
          alt={homeHero.alt}
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
        />
      ) : null}
      {homeBanner.enabled ? (
        <HomeBanner items={bannerItems} fallbackItems={homeBanner.items} allowEdit />
      ) : null}

      <div className="home-sections -mt-6">
      <section className="home-section space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="section-title">Agenda</h2>
          <Link href="/agenda" className="text-sm font-semibold">
            Tous les evenements
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <Card className="p-6 text-center text-slate">
            Aucun evenement publie pour le moment.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const image = typeof event.image === "object" ? event.image : null;
              return (
                <Link
                  key={event.id}
                  href={`/agenda/${event.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-card transition hover:-translate-y-1"
                >
                  <div className="relative h-36 w-full bg-gradient-to-br from-accent/15 via-white to-gold/30">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.alt ?? event.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate">Evenement</p>
                    <h3 className="text-lg font-display text-ink group-hover:text-accent">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate">{event.location || "Lieu a confirmer"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="home-section space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="section-title">Actualites</h2>
          <Link href="/actualites" className="text-sm font-semibold">
            Voir toutes les actualites
          </Link>
        </div>
        {news.length === 0 ? (
          <Card className="p-6 text-center text-slate">
            Aucune actualite publiee pour le moment.
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {news.map((item) => {
              const firstImage = (() => {
                const imageItem = item.images?.[0];
                if (!imageItem) return null;
                if (typeof imageItem.image === "string") return null;
                if (imageItem.image?.url) {
                  return {
                    url: imageItem.image.url,
                    alt: imageItem.alt ?? imageItem.image.alt ?? item.title
                  };
                }
                return null;
              })();

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-ink/10 bg-white shadow-card overflow-hidden"
                >
                  <div className="h-36 bg-gradient-to-br from-accent/15 via-white to-gold/30">
                    {firstImage ? (
                      <img
                        src={firstImage.url}
                        alt={firstImage.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                <div className="p-5 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate">
                    {formatShortDate(item.date)}
                  </p>
                  <h3 className="text-lg font-display text-ink">{item.title}</h3>
                  {item.summary ? (
                    <p className="text-sm text-slate">{item.summary}</p>
                  ) : null}
                  <Link
                    href={`/actualites/${item.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
                  >
                    Lire l'article
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                </article>
              );
            })}
          </div>
        )}
      </section>


      </div>
    </div>
  );
}
