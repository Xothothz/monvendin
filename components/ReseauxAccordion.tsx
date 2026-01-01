"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import clsx from "clsx";
import {
  Droplet,
  Flame,
  Globe,
  Image as ImageIcon,
  Lightbulb,
  Minus,
  Network,
  Phone,
  Plus,
  Waves,
  Zap
} from "lucide-react";
import { reseauxSections, type ReseauxSection } from "@/data/reseaux-data";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  "eau-potable": Droplet,
  assainissement: Waves,
  "eclairage-public": Lightbulb,
  "electricite-gaz": Zap,
  "fibre-optique": Network
};

const formatPhoneHref = (value?: string) => {
  if (!value) return null;
  const digits = value.replace(/[^\d+]/g, "");
  if (!digits || !/\d/.test(digits)) return null;
  return `tel:${digits}`;
};

const useHashAccordion = (sections: ReseauxSection[]) => {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      const exists = sections.some((section) => section.id === hash);
      setOpenId(exists ? hash : null);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [sections]);

  const setHash = (value: string | null) => {
    const base = `${window.location.pathname}${window.location.search}`;
    const next = value ? `${base}#${value}` : base;
    window.history.replaceState(null, "", next);
  };

  const toggle = (id: string) => {
    setOpenId((current) => {
      const next = current === id ? null : id;
      setHash(next);
      return next;
    });
  };

  return { openId, toggle };
};

export const ReseauxAccordion = () => {
  const sections = useMemo(() => reseauxSections, []);
  const { openId, toggle } = useHashAccordion(sections);

  return (
    <section className="space-y-4">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        const Icon = iconMap[section.id] ?? Zap;
        const panelId = `panel-${section.id}`;
        const buttonId = `accordion-${section.id}`;
        const hasContacts = section.contacts.length > 0;
        const isDouble = section.layout === "doubleEmergency";

        return (
          <div
            key={section.id}
            id={section.id}
            className="rounded-2xl border border-ink/10 bg-fog shadow-[0_18px_40px_-30px_rgba(15,23,42,0.25)]"
          >
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(section.id)}
              className={clsx(
                "flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent px-6 py-5 text-left transition-all duration-200 focus-ring",
                isOpen
                  ? "bg-accent text-white shadow-[0_16px_30px_-20px_rgba(12,44,132,0.6)]"
                  : "bg-fog text-accent hover:border-gold/40 hover:bg-goldSoft/40"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isOpen ? "bg-white/15 text-white" : "bg-white text-accent"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  {section.title}
                </span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20">
                {isOpen ? (
                  <Minus className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={clsx(
                "grid overflow-hidden transition-all duration-300",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="min-h-0">
                <div className="space-y-6 px-6 pb-6 pt-5">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.1fr_1.2fr_1fr]">
                    <div className="space-y-3">
                      {section.image.src ? (
                        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-ink/10 bg-white/80">
                          <img
                            src={section.image.src}
                            alt={section.image.alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-white text-center text-xs text-slate">
                          <ImageIcon className="mb-2 h-5 w-5 text-slate/70" />
                          Image a ajouter
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {section.center.logoSrc ? (
                        <img
                          src={section.center.logoSrc}
                          alt={`${section.title} logo`}
                          className="h-10 w-auto"
                          loading="lazy"
                        />
                      ) : null}
                      <p className="text-sm text-slate">{section.center.text}</p>
                      {section.center.bullets && section.center.bullets.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate">
                          {section.center.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <div className="space-y-4 md:col-span-2 lg:col-span-1">
                      {!hasContacts ? (
                        <div className="rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-slate">
                          Aucune information disponible pour le moment.
                        </div>
                      ) : isDouble ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                          {section.contacts.map((contact) => {
                            const phoneHref = formatPhoneHref(contact.phone);
                            return (
                              <div
                                key={contact.label}
                                className="rounded-2xl border border-ink/10 bg-white px-4 py-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                  {contact.label}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink">
                                  {contact.label.toLowerCase().includes("gaz") ? (
                                    <Flame className="h-4 w-4 text-gold" aria-hidden="true" />
                                  ) : (
                                    <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
                                  )}
                                  {phoneHref ? (
                                    <a href={phoneHref} className="hover:text-accent">
                                      {contact.phone}
                                    </a>
                                  ) : (
                                    <span className="text-slate">Numero a communiquer</span>
                                  )}
                                </div>
                                {contact.note ? (
                                  <p className="mt-1 text-xs text-slate">{contact.note}</p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {section.contacts.map((contact) => {
                            const phoneHref = formatPhoneHref(contact.phone);
                            return (
                              <div
                                key={contact.label}
                                className="rounded-2xl border border-ink/10 bg-white px-4 py-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                  {contact.label}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink">
                                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                                  {phoneHref ? (
                                    <a href={phoneHref} className="hover:text-accent">
                                      {contact.phone}
                                    </a>
                                  ) : (
                                    <span className="text-slate">Numero a communiquer</span>
                                  )}
                                </div>
                                {contact.note ? (
                                  <p className="mt-1 text-xs text-slate">{contact.note}</p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {section.website ? (
                        <a
                          href={section.website.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                        >
                          <Globe className="h-4 w-4" aria-hidden="true" />
                          {section.website.label}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};
