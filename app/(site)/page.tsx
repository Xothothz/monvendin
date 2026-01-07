import Link from "next/link";
import {
  ArrowRight,
  Bank,
  CalendarBlank,
  ForkKnife,
  MapPinLine,
  Newspaper,
  Recycle,
  Users,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Card } from "@/components/Card";
import homeBanner from "@/data/home-banner.json";
import { HomeBanner } from "@/components/HomeBanner";
import homeHero from "@/data/home-hero.json";
import { HeroAdmin } from "@/components/HeroAdmin";
import { getWeatherSnapshot } from "@/lib/weather";

export const dynamic = "force-dynamic";

const quickTiles = [
  {
    label: "Actualites",
    href: "/actualites",
    icon: Newspaper,
    tone: "accent"
  },
  {
    label: "Agenda",
    href: "/agenda",
    icon: CalendarBlank,
    tone: "accent"
  },
  {
    label: "Conseil municipal",
    href: "/ma-ville/conseil-municipal",
    icon: Bank,
    tone: "warning"
  },
  {
    label: "Delegues de quartier",
    href: "/ma-ville/delegues-quartier",
    icon: UsersThree,
    tone: "warning"
  },
  {
    label: "Dechets",
    href: "/vie-pratique/dechets",
    icon: Recycle,
    tone: "gold"
  },
  {
    label: "Urbanisme",
    href: "/vie-pratique/urbanisme",
    icon: MapPinLine,
    tone: "gold"
  },
  {
    label: "Accueil periscolaire",
    href: "/jeunesse/accueil-periscolaire",
    icon: Users,
    tone: "neutral"
  },
  {
    label: "Restaurant scolaire",
    href: "/jeunesse/restaurant-scolaire",
    icon: ForkKnife,
    tone: "neutral"
  }
] as const;

type InfoItem = {
  id?: string | number;
  label?: string | null;
  message: string;
  postedAt?: string | null;
  createdAt?: string | null;
  link?: string | null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(
    new Date(value)
  );

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(
    new Date(value)
  );

const formatInfoDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const getInfoDate = (item: InfoItem) =>
  new Date(item.postedAt ?? item.createdAt ?? 0).getTime();

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });
  const weather = await getWeatherSnapshot();
  let bannerItems = homeBanner.items;
  let latestInfos: InfoItem[] = [];
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
    const bannerDocs = (bannerResponse.docs ?? []) as InfoItem[];
    if (bannerDocs.length > 0) {
      bannerItems = bannerDocs.map((doc) => ({
        label: doc.label ?? "Info",
        message: doc.message
      }));
      latestInfos = bannerDocs;
    } else {
      latestInfos = homeBanner.items.map((item, index) => ({
        id: `fallback-${index}`,
        label: item.label ?? "Info",
        message: item.message,
        createdAt: nowIso
      }));
    }
  } catch {
    bannerItems = homeBanner.items;
    latestInfos = homeBanner.items.map((item, index) => ({
      id: `fallback-${index}`,
      label: item.label ?? "Info",
      message: item.message,
      createdAt: nowIso
    }));
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

  const sortedInfos = [...latestInfos].sort((a, b) => getInfoDate(b) - getInfoDate(a)).slice(0, 10);
  const infoLeft = sortedInfos.slice(0, 5);
  const infoRight = sortedInfos.slice(5, 10);

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

  const renderInfoItem = (item: InfoItem) => {
    const infoDate = formatInfoDate(item.postedAt ?? item.createdAt);
    const content = (
      <div className="home-info-card">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate">
          <span>{item.label ?? "Info"}</span>
          {infoDate ? <span className="text-ink/50">{infoDate}</span> : null}
        </div>
        <p className="home-info-message">{item.message}</p>
        {item.link ? (
          <span className="info-link-indicator">Lien externe ↗</span>
        ) : null}
      </div>
    );

    if (item.link) {
      return (
        <a
          key={String(item.id ?? item.message)}
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="home-info-link"
        >
          {content}
        </a>
      );
    }

    return <div key={String(item.id ?? item.message)}>{content}</div>;
  };

  return (
    <div className="home-pop space-y-10">
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
        <HomeBanner items={bannerItems} fallbackItems={homeBanner.items} allowEdit weather={weather} />
      ) : null}

      <div className="home-sections -mt-6">
        <section className="home-section space-y-6">
          <div className="home-section-inner">
            <div className="home-section-shapes" aria-hidden="true">
              <span className="home-shape home-shape-circle home-shape-quick-1" />
              <span className="home-shape home-shape-square home-shape-quick-2" />
              <span className="home-shape home-shape-diamond home-shape-quick-3" />
            </div>
            <div className="home-section-content space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="section-title motion-in">Acces rapides</h2>
                <Link href="/vie-pratique" className="home-section-link">
                  Voir les services
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quickTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <Link
                      key={tile.href}
                      href={tile.href}
                      className={`home-tile home-tile-${tile.tone}`}
                    >
                      <span className="home-tile-icon" aria-hidden="true">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="home-tile-label">{tile.label}</span>
                      <span className="home-tile-arrow" aria-hidden="true">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="home-section space-y-6">
          <div className="home-section-inner">
            <div className="home-section-shapes" aria-hidden="true">
              <span className="home-shape home-shape-oval home-shape-infos-1" />
              <span className="home-shape home-shape-triangle home-shape-infos-2" />
              <span className="home-shape home-shape-circle home-shape-infos-3" />
            </div>
            <div className="home-section-content space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="section-title motion-in">Dernieres infos</h2>
                <Link href="/infos" className="home-inline-link">
                  Historique complet
                </Link>
              </div>
              {sortedInfos.length === 0 ? (
                <Card className="p-6 text-center text-slate">
                  Aucune info publiee pour le moment.
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">{infoLeft.map(renderInfoItem)}</div>
                  <div className="space-y-3">{infoRight.map(renderInfoItem)}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="home-section space-y-6">
          <div className="home-section-inner">
            <div className="home-section-shapes" aria-hidden="true">
              <span className="home-shape home-shape-oval home-shape-agenda-1" />
              <span className="home-shape home-shape-circle home-shape-agenda-2" />
              <span className="home-shape home-shape-square home-shape-agenda-3" />
            </div>
            <div className="home-section-content space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="section-title motion-in">Agenda</h2>
                <Link href="/agenda" className="home-inline-link">
                  Tous les evenements
                </Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <Card className="p-6 text-center text-slate">
                  Aucun evenement publie pour le moment.
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger">
                  {upcomingEvents.map((event) => {
                    const image = typeof event.image === "object" ? event.image : null;
                    return (
                      <Link
                        key={event.id}
                        href={`/agenda/${event.slug}`}
                        className="home-card group flex h-full flex-col overflow-hidden"
                      >
                        <div className="relative h-36 w-full bg-gradient-to-br from-accent/10 via-white to-gold/20">
                          {image?.url ? (
                            <img
                              src={image.url}
                              alt={image.alt ?? event.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink shadow-[0_10px_22px_rgba(15,23,42,0.08)] backdrop-blur">
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
            </div>
          </div>
        </section>

        <section className="home-section space-y-6">
          <div className="home-section-inner">
            <div className="home-section-shapes" aria-hidden="true">
              <span className="home-shape home-shape-square home-shape-news-1" />
              <span className="home-shape home-shape-diamond home-shape-news-2" />
              <span className="home-shape home-shape-circle home-shape-news-3" />
            </div>
            <div className="home-section-content space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="section-title motion-in">Actualites</h2>
                <Link href="/actualites" className="home-inline-link">
                  Voir toutes les actualites
                </Link>
              </div>
              {news.length === 0 ? (
                <Card className="p-6 text-center text-slate">
                  Aucune actualite publiee pour le moment.
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-3 stagger">
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
                      <article key={item.id} className="home-card overflow-hidden">
                        <div className="h-36 bg-gradient-to-br from-accent/10 via-white to-gold/20">
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
