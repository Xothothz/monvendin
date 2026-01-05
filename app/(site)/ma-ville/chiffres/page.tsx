import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Card } from "@/components/Card";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Quelques chiffres"
};

const stats = [
  {
    title: "Population",
    value: "2 384 habitants",
    detail: "Population municipale 2022",
    accentClass: "from-gold/20 via-white to-white",
    glowClass: "bg-gold/30",
    borderClass: "border-gold/20"
  },
  {
    title: "Superficie",
    value: "3,6 km²",
    detail: "Surface communale",
    accentClass: "from-accentSoft/25 via-white to-white",
    glowClass: "bg-accentSoft/40",
    borderClass: "border-accentSoft/30"
  },
  {
    title: "Marais de Vendin-les-Bethune",
    value: "6,4274 ha",
    detail: "Site gere par le Conservatoire d'espaces naturels",
    accentClass: "from-sand/40 via-white to-white",
    glowClass: "bg-sand/80",
    borderClass: "border-sand/70"
  }
];

const distances = [
  { label: "Bethune", value: "4,4 km" },
  { label: "Lens", value: "22,8 km" },
  { label: "Lille", value: "41,8 km" },
  { label: "Paris", value: "213,5 km" }
];

export const dynamic = "force-dynamic";

export default async function ChiffresPage() {
  let heroImageUrl: string | null = "/images/chiffres-hero.png";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "chiffres"
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
    heroImageUrl = "/images/chiffres-hero.png";
    heroId = null;
  }

  return (
    <div className="space-y-8 section-stack">
      <HeroAdmin
        slug="chiffres"
        eyebrow="Ma ville"
        title="Quelques chiffres"
        subtitle="Donnees clefs et distances pour situer Vendin-les-Bethune."
        alt="Chiffres cles"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <CenteredPageHeader
        label="Vendin-les-Bethune"
        title="Quelques chiffres"
        description="Donnees clefs et distances pour situer Vendin-les-Bethune."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className={`group relative min-h-[220px] overflow-hidden border-ink/10 bg-gradient-to-br ${stat.accentClass} p-7 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.5)] sm:p-8 motion-safe:animate-fade-up`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div
                className={`absolute -right-12 -top-10 h-28 w-28 rounded-full blur-2xl ${stat.glowClass} opacity-80 motion-safe:animate-soft-float`}
              />
              <div
                className={`absolute -left-12 bottom-0 h-24 w-24 rounded-full blur-2xl ${stat.glowClass} opacity-60`}
              />
              <div className={`absolute inset-0 rounded-2xl border ${stat.borderClass}`} />
              <div className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-sheen" />
            </div>
            <div className="absolute right-6 top-6 h-16 w-16 rounded-2xl border border-white/60 bg-white/60 shadow-sm backdrop-blur" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="space-y-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate">
                  {stat.title}
                </p>
                <p className="text-4xl font-display leading-tight text-ink sm:text-5xl">
                  {stat.value}
                </p>
              </div>
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-ink/10 bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink/70">
                {stat.detail}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card
        className="relative overflow-hidden border-ink/10 bg-white p-6 text-ink shadow-[0_30px_70px_-45px_rgba(15,23,42,0.35)] sm:p-8 motion-safe:animate-fade-up"
        style={{ animationDelay: "420ms" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)]" />
        <div className="absolute -right-20 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-3xl motion-safe:animate-soft-float" />
        <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-accentSoft/30 blur-3xl" />
        <div className="relative space-y-6">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-ink/60">
              Distances (itineraires)
            </p>
            <p className="text-2xl font-display text-ink sm:text-3xl">Axes principaux</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {distances.map((distance) => (
              <li
                key={distance.label}
                className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-white/90 px-4 py-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.25)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">
                  {distance.label}
                </span>
                <span className="text-lg font-display text-ink">{distance.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
