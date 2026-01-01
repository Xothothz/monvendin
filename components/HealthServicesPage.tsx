"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Copy,
  FirstAidKit,
  Heartbeat,
  Hospital,
  MapPin,
  PhoneCall,
  Stethoscope,
  Syringe,
  Tooth,
} from "@phosphor-icons/react";
import { healthSections } from "@/data/health-services";
import { SearchInput } from "@/components/SearchInput";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

const filters = [
  { label: "Tous", value: "all" },
  { label: "Vendin", value: "vendin" },
  { label: "Hopitaux proches", value: "nearby" }
];

const sectionIcons: Record<string, React.ReactNode> = {
  pharmacie: <FirstAidKit className="h-7 w-7" aria-hidden="true" />,
  infirmiers: <Syringe className="h-7 w-7" aria-hidden="true" />,
  kine: <Heartbeat className="h-7 w-7" aria-hidden="true" />,
  orthophonistes: <Stethoscope className="h-7 w-7" aria-hidden="true" />,
  osteopathes: <Stethoscope className="h-7 w-7" aria-hidden="true" />,
  dentistes: <Tooth className="h-7 w-7" aria-hidden="true" />,
  hopitaux: <Hospital className="h-7 w-7" aria-hidden="true" />
};

const healthStats = {
  totalItems: healthSections.reduce((total, section) => total + section.items.length, 0),
  vendinCount: healthSections.reduce(
    (total, section) =>
      total + section.items.filter((item) => item.location === "vendin").length,
    0
  ),
  nearbyCount: healthSections.reduce(
    (total, section) =>
      total + section.items.filter((item) => item.location === "nearby").length,
    0
  )
};

const normalizeValue = (value: string) => value.toLowerCase();

const formatTelHref = (value: string) => value.replace(/[^\d+]/g, "");

const buildMapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export const HealthServicesHero = () => {
  const { totalItems, vendinCount, nearbyCount } = healthStats;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-accent/15 bg-gradient-to-br from-accentSoft/80 via-white to-white">
      <div className="absolute -right-12 -top-10 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-ink/5 blur-3xl" />
      <div className="relative grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              Services de sante
            </p>
            <h2 className="text-3xl font-display text-ink lg:text-4xl">
              Un panorama clair des professionnels et etablissements essentiels.
            </h2>
            <p className="text-sm text-slate lg:text-base">
              Contacts locaux, hopitaux a proximite et acces direct aux urgences.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total", value: totalItems },
              { label: "Vendin", value: vendinCount },
              { label: "Proximite", value: nearbyCount }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accentSoft text-accent">
              <FirstAidKit className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate">Urgences</p>
              <h3 className="text-lg font-display text-ink">Numeros utiles 24/24</h3>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate">
            En cas d&apos;urgence vitale, contactez immediatement les services adaptes.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "SAMU", number: "15" },
              { label: "Pompiers", number: "18" },
              { label: "Urgence UE", number: "112" }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-center"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate">
                  {item.label}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 text-xl font-semibold text-ink">
                  <PhoneCall className="h-5 w-5 text-accent" aria-hidden="true" />
                  {item.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const HealthServicesPage = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const normalizedQuery = normalizeValue(query.trim());
  const shouldFilterEmpty = normalizedQuery.length > 0 || filter !== "all";

  const filteredSections = useMemo(() => {
    return healthSections
      .map((section) => {
        const items = section.items.filter((item) => {
          if (filter !== "all" && item.location !== filter) return false;
          if (!normalizedQuery) return true;
          const haystack = [
            item.name,
            item.address,
            ...(item.services ?? []),
            ...item.sources.map((source) => source.label)
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        });
        return { ...section, items };
      })
      .filter((section) => (!shouldFilterEmpty ? true : section.items.length > 0));
  }, [filter, normalizedQuery, shouldFilterEmpty]);

  const totalResults = useMemo(
    () => filteredSections.reduce((total, section) => total + section.items.length, 0),
    [filteredSections]
  );

  const handleCopy = async (id: string, address: string) => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-12">
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="grid gap-3 lg:grid-cols-[2fr_1.5fr]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Rechercher un professionnel, une adresse, un service"
          />
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={clsx(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200",
                  filter === option.value
                    ? "border-accent bg-accent text-white shadow-[0_10px_20px_rgba(12,44,132,0.25)]"
                    : "border-ink/10 bg-white text-ink/70 hover:border-accent/40 hover:text-ink"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate">Sommaire</p>
            <h3 className="text-lg font-display text-ink">Acces direct</h3>
          </div>
          <p className="text-sm text-slate">
            {totalResults} resultat{totalResults > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {filteredSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/70 hover:border-accent/40 hover:text-ink"
            >
              {section.title}
            </a>
          ))}
        </div>
      </Card>

      <div className="space-y-12">
        {filteredSections.length === 0 ? (
          <p className="text-sm text-slate">Aucun resultat ne correspond a votre recherche.</p>
        ) : (
          filteredSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-32 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent">
                    {sectionIcons[section.id]}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate">
                      {section.items.length} adresse{section.items.length > 1 ? "s" : ""}
                    </p>
                    <h2 className="text-2xl font-display text-ink">{section.title}</h2>
                    <p className="text-sm text-slate max-w-2xl">{section.description}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">
                  Section {section.title}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {section.items.map((item) => {
                  const mainPhone = item.phones[0];
                  const mapsUrl = buildMapsUrl(item.address);
                  const locationLabel =
                    item.location === "vendin" ? "Dans Vendin-les-Bethune" : "A proximite";
                  return (
                    <Card
                      key={item.id}
                      className="p-5 flex flex-col gap-3 bg-gradient-to-br from-white to-accentSoft/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          {item.sources[0] ? (
                            <a
                              href={item.sources[0].url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-base font-display text-ink hover:text-accent"
                            >
                              {item.name}
                            </a>
                          ) : (
                            <h3 className="text-base font-display text-ink">{item.name}</h3>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant="accent">{locationLabel}</Badge>
                            {item.urgent ? (
                              <Badge variant="warning">Urgences 24/24</Badge>
                            ) : null}
                          </div>
                        </div>
                        {item.distance ? (
                          <span className="text-xs font-semibold text-slate">{item.distance}</span>
                        ) : null}
                      </div>

                      <div className="grid gap-2 text-xs text-slate sm:grid-cols-[1.4fr_0.6fr] sm:items-start">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                          <span className="leading-snug">{item.address}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.id, item.address)}
                            className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:text-ink"
                            aria-label={`Copier l'adresse de ${item.name}`}
                          >
                            <Copy className="h-3 w-3" aria-hidden="true" />
                            {copiedId === item.id ? "Copie" : "Copier"}
                          </button>
                        </div>

                        {item.phones.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {item.phones.map((phone) => (
                              <a
                                key={phone}
                                href={`tel:${formatTelHref(phone)}`}
                                className="font-semibold text-ink"
                              >
                                {phone}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="default">Telephone non communique</Badge>
                        )}
                      </div>

                      {item.services && item.services.length > 0 ? (
                        <p className="text-xs text-slate">
                          Services: {item.services.join(", ")}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        {mainPhone ? (
                          <a
                            href={`tel:${formatTelHref(mainPhone)}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_20px_rgba(12,44,132,0.25)]"
                            aria-label={`Appeler ${item.name}`}
                          >
                            <PhoneCall className="h-4 w-4" aria-hidden="true" />
                            Appeler
                          </a>
                        ) : null}
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/70 hover:border-accent/50 hover:text-ink"
                          aria-label={`Itineraire vers ${item.name}`}
                        >
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          Itineraire
                        </a>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
