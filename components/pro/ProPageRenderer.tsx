"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ProGalleryCarousel } from "./ProGalleryCarousel";

type MediaRef = {
  url?: string;
  alt?: string | null;
  filename?: string | null;
};

type HeroSection = {
  blockType: "hero";
  title?: string | null;
  subtitle?: string | null;
  bannerImage?: MediaRef | string | null;
  logo?: MediaRef | string | null;
  primaryCtaLabel?: string | null;
  primaryCtaUrl?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
  align?: "left" | "center" | null;
  textTone?: "light" | "dark" | null;
  overlay?: number | null;
  height?: "sm" | "md" | "lg" | null;
};

type AboutSection = {
  blockType: "about";
  title?: string | null;
  body?: string | null;
  image?: MediaRef | string | null;
  imagePosition?: "left" | "right" | null;
};

type ServicesItem = {
  image?: MediaRef | string | null;
  category?: string | null;
  name?: string | null;
  description?: string | null;
  price?: string | null;
};

type ServicesCategory = {
  title?: string | null;
  items?: ServicesItem[] | null;
};

type ServicesGroup = {
  title?: string | null;
  categories?: ServicesCategory[] | null;
  items?: ServicesItem[] | null;
};

type ServicesSection = {
  blockType: "services";
  variant?: "list" | "cards" | null;
  groups?: ServicesGroup[] | null;
  items?: ServicesItem[] | null;
};

type GalleryImage = {
  image?: MediaRef | string | null;
  alt?: string | null;
  caption: string | null;
};

type GallerySection = {
  blockType: "gallery";
  columns?: "2" | "3" | "4" | null;
  images?: GalleryImage[] | null;
};

type PricingOffer = {
  title?: string | null;
  price?: string | null;
  description?: string | null;
  points?: Array<{ text?: string | null }> | null;
};

type PricingSection = {
  blockType: "pricing";
  variant?: "table" | "cards" | null;
  offers?: PricingOffer[] | null;
};

type ContactSection = {
  blockType: "contact";
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  mapUrl?: string | null;
  hours?: Array<{ line?: string | null }> | null;
  socials?: Array<{ label?: string | null; url?: string | null }> | null;
};

type ProSection =
  | HeroSection
  | AboutSection
  | ServicesSection
  | GallerySection
  | PricingSection
  | ContactSection;

type ProPageHeader = {
  enabled?: boolean | null;
  align?: "left" | "center" | null;
  variant?: "simple" | "accent" | null;
};

type ProPageContent = {
  title?: string | null;
  header?: ProPageHeader | null;
  navEnabled?: boolean | null;
  navLabel?: string | null;
  navOrder?: number | null;
  sections?: ProSection[] | null;
};

type ProSitePages = {
  home?: ProPageContent | null;
  services?: ProPageContent | null;
  gallery?: ProPageContent | null;
  team?: ProPageContent | null;
  contact?: ProPageContent | null;
};

type ProSite = {
  name?: string | null;
  slug?: string | null;
  type?: "association" | "restaurant" | "prestataire" | null;
  theme?: string | null;
  palette?: string | null;
  typo?: string | null;
  pages?: ProSitePages | null;
};

type ProPageRendererProps = {
  site: ProSite;
  pageKey: "home" | "services" | "gallery" | "team" | "contact";
};

const getMediaUrl = (value?: MediaRef | string | null) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.url ?? null;
};

const getMediaAlt = (value?: MediaRef | string | null, fallback = "") => {
  if (!value || typeof value === "string") return fallback;
  return value.alt ?? fallback;
};

const ensureUrl = (value?: string | null) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("mailto:") || value.startsWith("tel:")) return value;
  return `https://${value}`;
};

const Section = ({ children }: { children: ReactNode }) => (
  <section className="pro-section">{children}</section>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="pro-title text-2xl sm:text-3xl">{children}</h2>
);

const findHeroLogo = (sections?: ProSection[] | null) => {
  if (!sections) return null;
  for (const section of sections) {
    if (section.blockType === "hero") {
      const logoUrl = getMediaUrl(section.logo);
      if (logoUrl) {
        return section;
      }
    }
  }
  return null;
};

const HeroBlock = ({ section }: { section: HeroSection }) => {
  const imageUrl = getMediaUrl(section.bannerImage);
  const overlay = Math.max(0, Math.min(80, section.overlay ?? 40));
  const height = section.height ?? "md";
  const align = section.align ?? "left";
  const textTone = section.textTone ?? "light";
  const hasImage = Boolean(imageUrl);
  const overlayValue = hasImage ? overlay : 0;

  return (
    <section className={`pro-hero pro-hero-${height} ${hasImage ? "has-image" : "no-image"}`}>
      {imageUrl ? (
        <div
          className="pro-hero-bg"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : null}
      <div
        className="pro-hero-overlay"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayValue / 100})` }}
      />
      <div className="pro-container pro-hero-inner">
        <div className={`pro-hero-content ${align === "center" ? "is-center" : ""}`}>
          <div className={`pro-hero-card ${textTone === "light" ? "is-light" : "is-dark"}`}>
            {section.title ? (
              <h1 className="pro-title text-4xl sm:text-5xl">{section.title}</h1>
            ) : null}
            {section.subtitle ? (
              <p className="pro-hero-subtitle">{section.subtitle}</p>
            ) : null}
            {(section.primaryCtaLabel && section.primaryCtaUrl) ||
            (section.secondaryCtaLabel && section.secondaryCtaUrl) ? (
              <div className="pro-hero-cta">
                {section.primaryCtaLabel && section.primaryCtaUrl ? (
                  <a
                    className="pro-button pro-button-primary"
                    href={ensureUrl(section.primaryCtaUrl) ?? "#"}
                  >
                    {section.primaryCtaLabel}
                  </a>
                ) : null}
                {section.secondaryCtaLabel && section.secondaryCtaUrl ? (
                  <a
                    className="pro-button pro-button-secondary"
                    href={ensureUrl(section.secondaryCtaUrl) ?? "#"}
                  >
                    {section.secondaryCtaLabel}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutBlock = ({ section }: { section: AboutSection }) => {
  const imageUrl = getMediaUrl(section.image);
  const imageLeft = section.imagePosition !== "right";
  const body = section.body ?? "";
  const hasHtml = /<[^>]+>/.test(body);

  return (
    <Section>
      <div className="pro-container">
        <div className={`pro-about ${imageUrl ? "has-image" : "no-image"}`}>
          {imageUrl && imageLeft ? (
            <img
              src={imageUrl}
              alt={getMediaAlt(section.image, "Photo")}
              className="pro-about-image"
            />
          ) : null}
          <div className="pro-about-content">
            {section.title ? <SectionTitle>{section.title}</SectionTitle> : null}
            {body ? (
              hasHtml ? (
                <div className="pro-rich" dangerouslySetInnerHTML={{ __html: body }} />
              ) : (
                <p className="pro-text">{body}</p>
              )
            ) : null}
          </div>
          {imageUrl && !imageLeft ? (
            <img
              src={imageUrl}
              alt={getMediaAlt(section.image, "Photo")}
              className="pro-about-image"
            />
          ) : null}
        </div>
      </div>
    </Section>
  );
};

const ServicesBlock = ({
  section,
  title
}: {
  section: ServicesSection;
  title: string;
}) => {
  const groups =
    section.groups && section.groups.length > 0
      ? section.groups
      : section.items && section.items.length > 0
        ? [{ title: null, items: section.items }]
        : [];
  const groupsWithItems = groups
    .map((group) => {
      const categories =
        group.categories && group.categories.length > 0
          ? group.categories
          : group.items && group.items.length > 0
            ? [{ title: null, items: group.items }]
            : [];
      const categoriesWithItems = categories.filter(
        (category) => (category.items ?? []).length > 0
      );
      return { ...group, categories: categoriesWithItems };
    })
    .filter((group) => (group.categories ?? []).length > 0);
  if (groupsWithItems.length === 0) return null;
  const isCards = section.variant === "cards";
  const groupKeys = useMemo(
    () =>
      groupsWithItems
        .map((group, groupIndex) => {
          const title = typeof group.title === "string" ? group.title.trim() : "";
          return title ? `group-${groupIndex}` : null;
        })
        .filter((key): key is string => Boolean(key)),
    [groupsWithItems]
  );
  const categoryKeys = useMemo(
    () =>
      groupsWithItems.flatMap((group, groupIndex) =>
        (group.categories ?? [])
          .map((category, categoryIndex) => {
            const title =
              typeof category.title === "string" ? category.title.trim() : "";
            return title ? `category-${groupIndex}-${categoryIndex}` : null;
          })
          .filter((key): key is string => Boolean(key))
      ),
    [groupsWithItems]
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const groupKeySignature = useMemo(() => groupKeys.join("|"), [groupKeys]);
  const categoryKeySignature = useMemo(
    () => categoryKeys.join("|"),
    [categoryKeys]
  );

  useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = {};
      for (const key of groupKeys) {
        next[key] = prev[key] ?? true;
      }
      const prevKeys = Object.keys(prev);
      if (
        prevKeys.length === groupKeys.length &&
        groupKeys.every((key) => prev[key] === next[key])
      ) {
        return prev;
      }
      return next;
    });
  }, [groupKeySignature]);

  useEffect(() => {
    setOpenCategories((prev) => {
      const next: Record<string, boolean> = {};
      for (const key of categoryKeys) {
        next[key] = prev[key] ?? true;
      }
      const prevKeys = Object.keys(prev);
      if (
        prevKeys.length === categoryKeys.length &&
        categoryKeys.every((key) => prev[key] === next[key])
      ) {
        return prev;
      }
      return next;
    });
  }, [categoryKeySignature]);

  const setAllAccordions = (open: boolean) => {
    const nextGroups: Record<string, boolean> = {};
    for (const key of groupKeys) {
      nextGroups[key] = open;
    }
    const nextCategories: Record<string, boolean> = {};
    for (const key of categoryKeys) {
      nextCategories[key] = open;
    }
    setOpenGroups(nextGroups);
    setOpenCategories(nextCategories);
  };

  return (
    <Section>
      <div className="pro-container space-y-6">
        <div className="pro-services-header">
          <SectionTitle>{title}</SectionTitle>
          {groupKeys.length > 0 || categoryKeys.length > 0 ? (
            <div className="pro-services-actions">
              <button
                type="button"
                className="pro-accordion-button"
                onClick={() => setAllAccordions(true)}
              >
                Tout déplier
              </button>
              <button
                type="button"
                className="pro-accordion-button pro-accordion-button--ghost"
                onClick={() => setAllAccordions(false)}
              >
                Tout replier
              </button>
            </div>
          ) : null}
        </div>
        <div className="pro-services-groups">
          {groupsWithItems.map((group, groupIndex) => {
            const groupTitle =
              typeof group.title === "string" ? group.title.trim() : "";
            const groupKey = `group-${groupIndex}`;
            const groupOpen = openGroups[groupKey] ?? true;
            const groupContent = (
              <div className="pro-services-categories">
                {(group.categories ?? []).map((category, categoryIndex) => {
                  const categoryTitle =
                    typeof category.title === "string" ? category.title.trim() : "";
                  const categoryKey = `category-${groupIndex}-${categoryIndex}`;
                  const categoryOpen = openCategories[categoryKey] ?? true;
                  const categoryContent = (
                    <div className={isCards ? "pro-grid pro-grid-cards" : "pro-list"}>
                      {(category.items ?? []).map((item, index) => {
                        const imageUrl = getMediaUrl(item.image ?? null);
                        if (isCards) {
                          return (
                            <div
                              key={`${item.name ?? "item"}-${index}`}
                              className="pro-card pro-service-card"
                            >
                              <div className="pro-item-header">
                                <div>
                                  {item.name ? (
                                    <h3 className="pro-item-title">{item.name}</h3>
                                  ) : null}
                                </div>
                                {item.price ? (
                                  <span className="pro-item-price">{item.price}</span>
                                ) : null}
                              </div>
                              <div className="pro-service-body">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={getMediaAlt(item.image, item.name ?? "Visuel")}
                                    className="pro-service-image"
                                    loading="lazy"
                                  />
                                ) : null}
                                {item.description ? (
                                  <p className="pro-text pro-text-muted">{item.description}</p>
                                ) : null}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`${item.name ?? "item"}-${index}`}
                            className="pro-list-item pro-menu-item"
                          >
                            <div className={`pro-menu-row ${imageUrl ? "has-image" : "no-image"}`}>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={getMediaAlt(item.image, item.name ?? "Visuel")}
                                  className="pro-menu-image"
                                  loading="lazy"
                                />
                              ) : null}
                              <div className="pro-menu-body">
                                <div className="pro-menu-header">
                                  <div className="pro-menu-title">
                                    {item.name ? (
                                      <h3 className="pro-item-title">{item.name}</h3>
                                    ) : null}
                                  </div>
                                  {item.price ? (
                                    <>
                                      <span className="pro-menu-dots" aria-hidden="true" />
                                      <span className="pro-item-price pro-menu-price">
                                        {item.price}
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                                {item.description ? (
                                  <p className="pro-text pro-text-muted pro-menu-desc">
                                    {item.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );

                  if (categoryTitle) {
                    return (
                      <details
                        key={`category-${groupIndex}-${categoryIndex}`}
                        className="pro-services-category"
                        open={categoryOpen}
                        onToggle={(event) => {
                          const isOpen = (event.currentTarget as HTMLDetailsElement).open;
                          setOpenCategories((prev) => ({
                            ...prev,
                            [categoryKey]: isOpen
                          }));
                        }}
                      >
                        <summary className="pro-services-category-summary">
                          <span className="pro-services-category-title">{categoryTitle}</span>
                        </summary>
                        {categoryContent}
                      </details>
                    );
                  }

                  return (
                    <div
                      key={`category-${groupIndex}-${categoryIndex}`}
                      className="pro-services-category"
                    >
                      {categoryContent}
                    </div>
                  );
                })}
              </div>
            );

            if (groupTitle) {
              return (
                <details
                  key={`group-${groupIndex}`}
                  className="pro-services-group"
                  open={groupOpen}
                  onToggle={(event) => {
                    const isOpen = (event.currentTarget as HTMLDetailsElement).open;
                    setOpenGroups((prev) => ({
                      ...prev,
                      [groupKey]: isOpen
                    }));
                  }}
                >
                  <summary className="pro-services-group-summary">
                    <span className="pro-services-group-title">{groupTitle}</span>
                  </summary>
                  {groupContent}
                </details>
              );
            }

            return (
              <div key={`group-${groupIndex}`} className="pro-services-group">
                {groupContent}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

const GalleryBlock = ({ section }: { section: GallerySection }) => {
  const images = section.images ?? [];
  if (images.length === 0) return null;
  const galleryItems = images
    .map((item) => {
      const src = getMediaUrl(item.image);
      if (!src) return null;
      return {
        src,
        alt: getMediaAlt(item.image, item.alt ?? "Photo"),
        caption: item.caption ?? null
      };
    })
    .filter((item): item is { src: string; alt: string; caption: string | null } => Boolean(item));

  if (galleryItems.length === 0) return null;

  return (
    <Section>
      <div className="pro-container space-y-6">
        <SectionTitle>Galerie</SectionTitle>
        <ProGalleryCarousel items={galleryItems} />
      </div>
    </Section>
  );
};

const PricingBlock = ({ section }: { section: PricingSection }) => {
  const offers = section.offers ?? [];
  if (offers.length === 0) return null;
  const isTable = section.variant === "table";

  return (
    <Section>
      <div className="pro-container space-y-6">
        <SectionTitle>Tarifs</SectionTitle>
        <div className={isTable ? "pro-list" : "pro-grid pro-grid-cards"}>
          {offers.map((offer, index) => (
            <div key={`${offer.title ?? "offer"}-${index}`} className={isTable ? "pro-list-item" : "pro-card"}>
              <div className="pro-item-header">
                <div>
                  {offer.title ? <h3 className="pro-item-title">{offer.title}</h3> : null}
                  {offer.description ? (
                    <p className="pro-text pro-text-muted">{offer.description}</p>
                  ) : null}
                </div>
                {offer.price ? <span className="pro-item-price">{offer.price}</span> : null}
              </div>
              {offer.points && offer.points.length > 0 ? (
                <ul className="pro-list-points">
                  {offer.points.map((point, pointIndex) => (
                    <li key={`${point?.text ?? "point"}-${pointIndex}`}>
                      {point?.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const ContactBlock = ({ section }: { section: ContactSection }) => {
  const fullAddress = [section.address, section.postalCode, section.city]
    .filter(Boolean)
    .join(" ");
  const mapUrl = ensureUrl(section.mapUrl);
  const websiteUrl = ensureUrl(section.website);

  return (
    <Section>
      <div className="pro-container space-y-6">
        <SectionTitle>Contact</SectionTitle>
        <div className="pro-grid pro-grid-contact">
          <div className="pro-card pro-card-accent space-y-3">
            {fullAddress ? (
              <div>
                <p className="pro-label">Adresse</p>
                <p className="pro-text">{fullAddress}</p>
                {mapUrl ? (
                  <a className="pro-link" href={mapUrl} target="_blank" rel="noreferrer">
                    Voir sur la carte
                  </a>
                ) : null}
              </div>
            ) : null}
            {section.phone ? (
              <div>
                <p className="pro-label">Telephone</p>
                <a className="pro-link" href={`tel:${section.phone}`}>
                  {section.phone}
                </a>
              </div>
            ) : null}
            {section.email ? (
              <div>
                <p className="pro-label">Email</p>
                <a className="pro-link" href={`mailto:${section.email}`}>
                  {section.email}
                </a>
              </div>
            ) : null}
            {websiteUrl ? (
              <div>
                <p className="pro-label">Site web</p>
                <a className="pro-link" href={websiteUrl} target="_blank" rel="noreferrer">
                  {section.website}
                </a>
              </div>
            ) : null}
          </div>
          <div className="pro-card pro-card-accent space-y-3">
            {section.hours && section.hours.length > 0 ? (
              <div>
                <p className="pro-label">Horaires</p>
                <ul className="pro-text space-y-1">
                  {section.hours.map((hour, index) => (
                    <li key={`${hour?.line ?? "hour"}-${index}`}>{hour?.line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {section.socials && section.socials.length > 0 ? (
              <div>
                <p className="pro-label">Reseaux</p>
                <ul className="pro-text space-y-1">
                  {section.socials.map((social, index) => (
                    <li key={`${social?.label ?? "social"}-${index}`}>
                      {social?.url ? (
                        <a
                          className="pro-link"
                          href={ensureUrl(social.url) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {social?.label ?? social?.url}
                        </a>
                      ) : (
                        <span>{social?.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
};

const pageLabels: Record<
  NonNullable<ProSite["type"]>,
  { home: string; services: string; gallery: string; team: string; contact: string }
> = {
  association: {
    home: "Accueil",
    services: "Actions",
    gallery: "Galerie",
    team: "Equipe",
    contact: "Contact"
  },
  restaurant: {
    home: "Accueil",
    services: "Menu",
    gallery: "Galerie",
    team: "Equipe",
    contact: "Contact"
  },
  prestataire: {
    home: "Accueil",
    services: "Services",
    gallery: "Galerie",
    team: "Equipe",
    contact: "Contact"
  }
};

const defaultNavEnabled = {
  home: true,
  services: true,
  gallery: true,
  team: false,
  contact: true
} as const;

const defaultNavOrder = {
  home: 0,
  services: 1,
  gallery: 2,
  team: 3,
  contact: 4
} as const;

const pagePaths = {
  home: "",
  services: "services",
  gallery: "galerie",
  team: "equipe",
  contact: "contact"
} as const;

export const ProPageRenderer = ({ site, pageKey }: ProPageRendererProps) => {
  const theme = site.theme ?? "moderne";
  const palette = site.palette ?? "ocean";
  const typo = site.typo ?? "fraunces-source";
  const pages = site.pages ?? {};
  const page = pages?.[pageKey];
  const sections = page?.sections ?? [];
  const labels =
    pageLabels[site.type ?? "prestataire"] ?? pageLabels.prestataire;
  const siteSlug = site.slug ?? "";
  const navItems = (Object.keys(pagePaths) as Array<keyof typeof pagePaths>)
    .map((key) => {
      const pageData = pages?.[key];
      return {
        key,
        path: pagePaths[key],
        navLabel: pageData?.navLabel ?? labels[key],
        navEnabled:
          key === "home" ? true : (pageData?.navEnabled ?? defaultNavEnabled[key]),
        navOrder: key === "home" ? 0 : (pageData?.navOrder ?? defaultNavOrder[key])
      };
    })
    .filter((item) => item.key === "home" || item.navEnabled)
    .sort((a, b) => a.navOrder - b.navOrder);
  const headerConfig = page?.header ?? null;
  const headerEnabled = headerConfig?.enabled ?? (pageKey !== "home" && Boolean(page?.title));
  const headerAlign = headerConfig?.align ?? "left";
  const headerVariant = headerConfig?.variant ?? "simple";
  const showHeader = pageKey !== "home" && headerEnabled && Boolean(page?.title);
  const logoSection =
    findHeroLogo(pages.home?.sections) ??
    findHeroLogo(pages.services?.sections) ??
    findHeroLogo(pages.gallery?.sections) ??
    findHeroLogo(pages.team?.sections) ??
    findHeroLogo(pages.contact?.sections);
  const logoUrl = logoSection ? getMediaUrl(logoSection.logo) : null;
  const logoAlt = logoSection
    ? getMediaAlt(logoSection.logo, site.name ?? "Logo")
    : "Logo";

  return (
    <div className="pro-page" data-theme={theme} data-palette={palette} data-typo={typo}>
      <nav className="pro-site-nav">
        <div className="pro-container">
          <div className="pro-site-nav-inner">
            <a className="pro-site-back" href="/">
              Retour a Monvendin
            </a>
            <div className="pro-site-links-wrap">
              {logoUrl ? (
                <a className="pro-site-logo-link" href={`/pro/${siteSlug}`}>
                  <img className="pro-site-logo" src={logoUrl} alt={logoAlt} />
                </a>
              ) : null}
              <div className="pro-site-links">
                {navItems.map((item) => {
                  const href = item.path ? `/pro/${siteSlug}/${item.path}` : `/pro/${siteSlug}`;
                  return (
                    <a
                      key={item.key}
                      href={href}
                      className={pageKey === item.key ? "is-active" : undefined}
                    >
                      {item.navLabel}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showHeader ? (
        <section
          className={`pro-page-header ${headerAlign === "center" ? "is-center" : "is-left"} ${headerVariant === "accent" ? "is-accent" : "is-simple"}`}
        >
          <div className="pro-container">
            <h1 className="pro-title text-3xl sm:text-4xl">{page?.title ?? ""}</h1>
          </div>
        </section>
      ) : null}

      {sections.map((section, index) => {
        switch (section.blockType) {
          case "hero":
            return <HeroBlock key={`hero-${index}`} section={section} />;
          case "about":
            return <AboutBlock key={`about-${index}`} section={section} />;
          case "services":
            return (
              <ServicesBlock
                key={`services-${index}`}
                section={section}
                title={pageKey === "services" ? labels.services : "Services"}
              />
            );
          case "gallery":
            return <GalleryBlock key={`gallery-${index}`} section={section} />;
          case "pricing":
            return <PricingBlock key={`pricing-${index}`} section={section} />;
          case "contact":
            return <ContactBlock key={`contact-${index}`} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
};
