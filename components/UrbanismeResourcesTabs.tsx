"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { ArrowRight } from "@phosphor-icons/react";
import { Badge } from "@/components/Badge";

type ResourceItem = {
  title: string;
  description: string;
  href?: string;
  secondaryLink?: {
    label: string;
    href: string;
  };
  badge: "officiel" | "info" | "coming";
  ctaLabel: string;
  preview?: "pdf" | "image";
};

type TabItem = {
  id: string;
  label: string;
  items: ResourceItem[];
  note?: string;
  infoBox?: string;
};

const badgeVariant = (value: ResourceItem["badge"]) => {
  switch (value) {
    case "officiel":
      return "accent";
    case "coming":
      return "warning";
    default:
      return "default";
  }
};

const badgeLabel = (value: ResourceItem["badge"]) => {
  switch (value) {
    case "officiel":
      return "Officiel";
    case "coming":
      return "A venir";
    default:
      return "A titre informatif";
  }
};

const tabs: TabItem[] = [
  {
    id: "documents",
    label: "Documents",
    note:
      "Certains documents peuvent varier selon les secteurs. En cas de doute, contactez le service urbanisme.",
    items: [
      {
        title: "Plan de zonage",
        description: "Retrouvez votre zone et les regles associees.",
        href: "/docs/plan-zonage.pdf",
        badge: "officiel",
        ctaLabel: "Consulter",
        preview: "pdf"
      },
      {
        title: "PLU - Reglement",
        description: "Reglementation du Plan Local d'Urbanisme.",
        href: "/docs/plu-reglement.pdf",
        badge: "officiel",
        ctaLabel: "Consulter",
        preview: "pdf"
      },
      {
        title: "PPM - Perimetres monuments historiques",
        description:
          "Perimetres de protection autour des monuments historiques (si applicable).",
        badge: "coming",
        ctaLabel: "Indisponible"
      },
      {
        title: "Tous les documents",
        description:
          "Archive complete des documents d'urbanisme de Vendin-les-Bethune.",
        href:
          "https://www.geoportail-urbanisme.gouv.fr/api/document/84a2b1d36f3c6505e8ef5dc481e98484/download/62841_PLU_20230126.zip",
        secondaryLink: {
          label: "Voir sur Geoportail",
          href:
            "https://www.geoportail-urbanisme.gouv.fr/map/#tile=1&lon=2.5501631651426293&lat=50.545295313706816&zoom=15&mlon=2.608012&mlat=50.547184"
        },
        badge: "officiel",
        ctaLabel: "Telecharger"
      }
    ]
  },
  {
    id: "cadastre",
    label: "Cadastre",
    items: [
      {
        title: "Site web du cadastre",
        description: "Consultez le plan cadastral et recherchez une parcelle.",
        href: "https://www.cadastre.gouv.fr/",
        badge: "officiel",
        ctaLabel: "Consulter"
      }
    ]
  },
  {
    id: "ppri",
    label: "PPRI",
    infoBox:
      "Vendin-les-Bethune n'est pas identifiee ici comme commune couverte par ce PPRI. Ressource fournie a titre informatif.",
    items: [
      {
        title: "Toutes les informations sur le PPRi de la Vallee de la Lawe",
        description:
          "Ce PPRI ne concerne pas necessairement Vendin-les-Bethune. Il est propose pour information sur le territoire voisin (Vallee de la Lawe).",
        href:
          "https://www.pas-de-calais.gouv.fr/Actions-de-l-Etat/Prevention-des-risques-majeurs/Plan-de-prevention-des-risques/PPRN-applicables2/PPRi-de-la-vallee-de-la-Lawe",
        badge: "info",
        ctaLabel: "Consulter"
      }
    ]
  }
];

export const UrbanismeResourcesTabs = () => {
  const [active, setActive] = useState(tabs[0]?.id ?? "documents");
  const [activePreview, setActivePreview] = useState<ResourceItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const current = useMemo(() => tabs.find((tab) => tab.id === active), [active]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!activePreview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePreview(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePreview]);

  if (!current) return null;

  const gridClass =
    current.items.length === 1
      ? "sm:grid-cols-1"
      : current.items.length >= 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-display text-ink">En savoir plus</h2>

      <div className="-mx-2 overflow-x-auto px-2">
        <div className="flex w-max gap-2 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={clsx(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] border transition focus-ring",
                active === tab.id
                  ? "bg-accent text-white border-accent shadow-card"
                  : "bg-white text-ink/70 border-ink/10 hover:border-ink/20"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <div
          className={clsx(
            "grid gap-4",
            gridClass,
            current.items.length === 1 && "max-w-xl mx-auto"
          )}
        >
          {current.items.map((item) => {
            const isDisabled = !item.href;
            const isPreview = Boolean(item.preview);

            // ✅ Fix TS : force des littéraux "a" | "button"

            const Tag: "a" | "button" = item.href && !isPreview ? "a" : "button";
            // ✅ Fix TS : force type="button" en littéral, pas string
            const tagProps =
              item.href && !isPreview
                ? { href: item.href, target: "_blank", rel: "noreferrer" }
                : {
                    type: "button" as const,
                    disabled: isDisabled,
                    "aria-disabled": isDisabled,
                    onClick: () => {
                      if (item.href && isPreview) {
                        setActivePreview(item);
                      }
                    }
                  };

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-display text-ink">{item.title}</h3>
                  <Badge variant={badgeVariant(item.badge)}>
                    {badgeLabel(item.badge)}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-slate">{item.description}</p>

                <Tag
                  {...tagProps}
                  className={clsx(
                    "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition",
                    isDisabled
                      ? "cursor-not-allowed border border-ink/10 bg-fog text-slate/60"
                      : "border border-ink/10 bg-white text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
                  )}
                >
                  {item.ctaLabel}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Tag>

                {item.secondaryLink ? (
                  <a
                    href={item.secondaryLink.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                  >
                    {item.secondaryLink.label}
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>

        {current.note ? (
          <p className="mt-4 text-sm text-slate">{current.note}</p>
        ) : null}

        {current.infoBox ? (
          <div className="mt-4 rounded-2xl border border-ink/10 bg-fog px-4 py-3 text-sm text-slate">
            {current.infoBox}
          </div>
        ) : null}
      </div>

      {activePreview?.href && isMounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activePreview.title}
              className="fixed inset-0 z-[2147483647] bg-ink/70 backdrop-blur-sm"
              onClick={() => setActivePreview(null)}
            >
              <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
                <div
                  className="relative flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                    <p className="text-sm font-semibold text-ink">
                      {activePreview.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActivePreview(null)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card"
                    >
                      Fermer
                    </button>
                  </div>

                  {activePreview.preview === "image" ? (
                    <div className="flex h-full w-full items-center justify-center bg-ink/5 p-4">
                      <img
                        src={activePreview.href}
                        alt={activePreview.title}
                        className="h-full max-h-[80vh] w-auto max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <iframe
                      title={activePreview.title}
                      src={`${activePreview.href}#view=FitH`}
                      className="h-full w-full"
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink/10 px-4 py-3">
                    <a
                      href={activePreview.href}
                      download
                      className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
                    >
                      Telecharger
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Image
              src="/images/territoires62-logo.png"
              alt="Territoires 62"
              width={231}
              height={219}
              className="h-12 w-auto sm:h-14"
              sizes="(min-width: 640px) 56px, 48px"
            />
            <h2 className="text-2xl font-display text-ink">
              Projets d&apos;amenagement : terrains a batir (Chemin de l&apos;Abbaye)
            </h2>
          </div>
          <p className="text-sm text-slate">
            Une operation de commercialisation de terrains a batir viabilises,
            libres de constructeur, portee par Territoires 62.
          </p>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr] lg:items-start">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  setActivePreview({
                    title: "Terrains a batir - Chemin de l'Abbaye",
                    description: "",
                    href: "/images/terrains-abbaye.jpg",
                    badge: "officiel",
                    ctaLabel: "Consulter",
                    preview: "image"
                  })
                }
                className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-ink/10 bg-fog focus-ring"
                aria-label="Agrandir l'illustration des terrains a batir"
              >
                <Image
                  src="/images/terrains-abbaye.jpg"
                  alt="Illustration des terrains a batir"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-card">
                  Zoom
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">Vendin-lez-Bethune</Badge>
                <Badge variant="default">Terrains viabilises</Badge>
                <Badge variant="default">Libre de constructeur</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-display text-ink">
                  Terrains a batir - Chemin de l&apos;Abbaye
                </h3>
                <p className="text-sm text-slate">
                  Cette operation presente plusieurs lots disponibles (surfaces
                  et prix variables). Pour les details, plans et disponibilites,
                  consultez la page officielle Territoires 62.
                </p>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-fog px-4 py-3 text-sm text-ink/70">
                <p className="font-semibold text-ink">Infos cles</p>
                <ul className="mt-2 list-disc pl-4 text-sm text-slate">
                  <li>Localisation : Vendin-lez-Bethune (Chemin de l&apos;Abbaye)</li>
                  <li>Lots : consulter la page officielle (donnees evolutives)</li>
                  <li>Amenageur : Territoires 62</li>
                </ul>
              </div>

              <a
                href="https://www.territoires62.fr/operation/terrains-a-batir-vendin-lez-bethune-terrain-a-vendre-viabilise-libre-de-constructeurs-chemin-de-l-abbaye/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 transition hover:border-gold/40 hover:bg-goldSoft/40"
              >
                Voir le projet sur Territoires62.fr
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate">
          Les disponibilites, prix et caracteristiques sont fournis par
          Territoires 62 et peuvent evoluer. Referez-vous a la page officielle.
        </p>
      </div>
    </section>
  );
};
