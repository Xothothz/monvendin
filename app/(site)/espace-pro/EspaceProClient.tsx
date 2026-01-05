"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ProPageRenderer } from "@/components/pro/ProPageRenderer";

type User = {
  id: string | number;
  name?: string | null;
  email?: string | null;
  role?: "admin" | "user";
};

type MediaValue =
  | {
      id?: string | number;
      url?: string | null;
      alt?: string | null;
    }
  | string
  | number
  | null;

type ProSection = {
  id?: string;
  blockType: "hero" | "about" | "services" | "gallery" | "pricing" | "contact";
  [key: string]: unknown;
};

type ProPageHeader = {
  enabled?: boolean;
  align?: "left" | "center" | null;
  variant?: "simple" | "accent" | null;
};

type ProSitePage = {
  title?: string | null;
  header?: ProPageHeader | null;
  navEnabled?: boolean | null;
  navLabel?: string | null;
  navOrder?: number | null;
  sections?: ProSection[] | null;
};

type ProSitePages = {
  home?: ProSitePage | null;
  services?: ProSitePage | null;
  gallery?: ProSitePage | null;
  team?: ProSitePage | null;
  contact?: ProSitePage | null;
};

type ProSite = {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  type?: "association" | "restaurant" | "prestataire" | null;
  status?: "draft" | "published" | null;
  theme?: "moderne" | "chaleureux" | "minimal" | null;
  palette?: "ocean" | "terracotta" | "olive" | "sable" | "charcoal" | "bleu-nuit" | null;
  typo?: "fraunces-source" | "cormorant-work" | "bebas-dm" | null;
  pages?: ProSitePages | null;
};

type ProSiteResponse = {
  docs: ProSite[];
};

const sectionLabels: Record<ProSection["blockType"], string> = {
  hero: "Hero",
  about: "Bloc de texte",
  services: "Services / Menu",
  gallery: "Galerie",
  pricing: "Tarifs",
  contact: "Contact"
};

const pageKeys: Array<keyof ProSitePages> = ["home", "services", "gallery", "team", "contact"];

const pageLabelMap: Record<
  NonNullable<ProSite["type"]>,
  Record<keyof ProSitePages, string>
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

const pagePathMap: Record<keyof ProSitePages, string> = {
  home: "",
  services: "services",
  gallery: "galerie",
  team: "equipe",
  contact: "contact"
};

const buildDefaultHeader = (key: keyof ProSitePages): ProPageHeader => ({
  enabled: key !== "home",
  align: "left",
  variant: "simple"
});

const defaultNavEnabled: Record<keyof ProSitePages, boolean> = {
  home: true,
  services: true,
  gallery: true,
  team: false,
  contact: true
};

const defaultNavOrder: Record<keyof ProSitePages, number> = {
  home: 0,
  services: 1,
  gallery: 2,
  team: 3,
  contact: 4
};

const paletteOptions: Array<{
  value: NonNullable<ProSite["palette"]>;
  label: string;
  bg: string;
  accent: string;
  text: string;
}> = [
  { value: "ocean", label: "Ocean", bg: "#f4f8f7", accent: "#1e7a7a", text: "#0e2a2a" },
  {
    value: "terracotta",
    label: "Terracotta",
    bg: "#fff5f0",
    accent: "#c65a3a",
    text: "#2e1c14"
  },
  { value: "olive", label: "Olive", bg: "#f7f6f0", accent: "#6a7b2e", text: "#1f2b1f" },
  { value: "sable", label: "Sable", bg: "#faf7f2", accent: "#c9a24f", text: "#2c241c" },
  {
    value: "charcoal",
    label: "Charcoal",
    bg: "#f5f5f5",
    accent: "#3a6d8c",
    text: "#1a1a1a"
  },
  {
    value: "bleu-nuit",
    label: "Bleu nuit",
    bg: "#f2f5f8",
    accent: "#2f5d8c",
    text: "#0e1a2b"
  }
];

const typoOptions: Array<{
  value: NonNullable<ProSite["typo"]>;
  label: string;
  fontFamily: string;
}> = [
  {
    value: "fraunces-source",
    label: "Fraunces + Source Sans",
    fontFamily: "var(--font-display), var(--font-sans), serif"
  },
  {
    value: "cormorant-work",
    label: "Cormorant + Work Sans",
    fontFamily: "var(--font-cormorant), var(--font-work), serif"
  },
  {
    value: "bebas-dm",
    label: "Bebas + DM Sans",
    fontFamily: "var(--font-bebas), var(--font-dm), sans-serif"
  }
];

const buildEmptyPages = (type?: ProSite["type"]) => {
  const labels = pageLabelMap[type ?? "prestataire"];
  return {
    home: {
      title: labels.home,
      header: buildDefaultHeader("home"),
      navEnabled: defaultNavEnabled.home,
      navLabel: labels.home,
      navOrder: defaultNavOrder.home,
      sections: []
    },
    services: {
      title: labels.services,
      header: buildDefaultHeader("services"),
      navEnabled: defaultNavEnabled.services,
      navLabel: labels.services,
      navOrder: defaultNavOrder.services,
      sections: []
    },
    gallery: {
      title: labels.gallery,
      header: buildDefaultHeader("gallery"),
      navEnabled: defaultNavEnabled.gallery,
      navLabel: labels.gallery,
      navOrder: defaultNavOrder.gallery,
      sections: []
    },
    team: {
      title: labels.team,
      header: buildDefaultHeader("team"),
      navEnabled: defaultNavEnabled.team,
      navLabel: labels.team,
      navOrder: defaultNavOrder.team,
      sections: []
    },
    contact: {
      title: labels.contact,
      header: buildDefaultHeader("contact"),
      navEnabled: defaultNavEnabled.contact,
      navLabel: labels.contact,
      navOrder: defaultNavOrder.contact,
      sections: []
    }
  } as ProSitePages;
};

const normalizePageContent = (
  key: keyof ProSitePages,
  page: ProSitePage | null | undefined,
  label: string
): ProSitePage => {
  const safePage = page ?? {};
  return {
    ...safePage,
    title: safePage.title ?? label,
    header: { ...buildDefaultHeader(key), ...(safePage.header ?? {}) },
    navEnabled:
      key === "home" ? true : (safePage.navEnabled ?? defaultNavEnabled[key]),
    navLabel: safePage.navLabel ?? label,
    navOrder: key === "home" ? 0 : (safePage.navOrder ?? defaultNavOrder[key]),
    sections: safePage.sections ?? []
  };
};

const normalizeSite = (site: ProSite & { sections?: ProSection[] }) => {
  const labels = pageLabelMap[site.type ?? "prestataire"];
  const pages = site.pages ?? buildEmptyPages(site.type);
  const normalizedPages: ProSitePages = {
    home: normalizePageContent("home", pages.home ?? null, labels.home),
    services: normalizePageContent("services", pages.services ?? null, labels.services),
    gallery: normalizePageContent("gallery", pages.gallery ?? null, labels.gallery),
    team: normalizePageContent("team", pages.team ?? null, labels.team),
    contact: normalizePageContent("contact", pages.contact ?? null, labels.contact)
  };
  const legacySections = Array.isArray((site as any).sections)
    ? ((site as any).sections as ProSection[])
    : [];
  if (legacySections.length > 0) {
    normalizedPages.home = {
      ...normalizedPages.home,
      sections: legacySections
    };
  }
  return { ...site, pages: normalizedPages };
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

const getSectionSummary = (section: ProSection) => {
  switch (section.blockType) {
    case "hero": {
      const title = (section.title as string) ?? "";
      return title.trim() ? title : "Banniere principale";
    }
    case "about": {
      const body = (section.body as string) ?? "";
      const plainText = stripHtml(body);
      const snippet = plainText.slice(0, 42);
      return snippet
        ? `${snippet}${plainText.length > 42 ? "..." : ""}`
        : "Texte a completer";
    }
    case "services": {
      const groups = Array.isArray(section.groups) ? section.groups : [];
      if (groups.length > 0) {
        return `${groups.length} sections`;
      }
      const count = Array.isArray(section.items) ? section.items.length : 0;
      return count > 0 ? `${count} elements` : "Aucun element";
    }
    case "gallery": {
      const count = Array.isArray(section.images) ? section.images.length : 0;
      return count > 0 ? `${count} photos` : "Aucune photo";
    }
    case "pricing": {
      const count = Array.isArray(section.offers) ? section.offers.length : 0;
      return count > 0 ? `${count} offres` : "Aucune offre";
    }
    case "contact": {
      const phone = (section.phone as string) ?? "";
      const email = (section.email as string) ?? "";
      return phone || email ? "Coordonnees OK" : "Coordonnees manquantes";
    }
    default:
      return "";
  }
};

const fetchCurrentUser = async () => {
  const response = await fetch("/api/users/me", { credentials: "include" });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return (data?.user ?? null) as User | null;
};

const fetchSites = async (userId: string | number) => {
  const params = new URLSearchParams();
  params.set("depth", "2");
  params.set("limit", "50");
  params.set("sort", "-updatedAt");
  params.set("where[owner][equals]", String(userId));
  const response = await fetch(`/api/pro-pages?${params.toString()}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = (await response.json()) as ProSiteResponse;
  return data.docs ?? [];
};

const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Upload impossible.");
  }
  const data = await response.json();
  const doc = data?.doc ?? data;
  return {
    id: doc?.id ?? doc?._id ?? null,
    url: doc?.url ?? null
  };
};

const getMediaUrl = (value: MediaValue) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return null;
  return value.url ?? null;
};

const normalizeMedia = (value: MediaValue) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  return value.id ?? null;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const buildEmptySection = (type: ProSection["blockType"]): ProSection => {
  switch (type) {
    case "hero":
      return {
        blockType: "hero",
        title: "Titre principal",
        subtitle: "Sous-titre",
        align: "left",
        textTone: "light",
        overlay: 40,
        height: "md"
      };
    case "about":
      return {
        blockType: "about",
        title: "Bloc de texte",
        body: "",
        imagePosition: "left"
      };
    case "services":
      return {
        blockType: "services",
        variant: "list",
        groups: [],
        items: []
      };
    case "gallery":
      return {
        blockType: "gallery",
        columns: "3",
        images: []
      };
    case "pricing":
      return {
        blockType: "pricing",
        variant: "cards",
        offers: []
      };
    case "contact":
    default:
      return {
        blockType: "contact",
        hours: [],
        socials: []
      };
  }
};

const serializeSections = (sections: ProSection[]) =>
  sections.map((section) => {
    if (section.blockType === "hero") {
      return {
        ...section,
        bannerImage: normalizeMedia(section.bannerImage as MediaValue),
        logo: normalizeMedia(section.logo as MediaValue)
      };
    }
    if (section.blockType === "about") {
      return {
        ...section,
        image: normalizeMedia(section.image as MediaValue)
      };
    }
    if (section.blockType === "services") {
      const items = Array.isArray(section.items) ? section.items : [];
      const groups = Array.isArray(section.groups) ? section.groups : [];
      const normalizedGroups =
        groups.length > 0
          ? groups.map((group: any) => {
              const groupItems = Array.isArray(group.items) ? group.items : [];
              const categories = Array.isArray(group.categories) ? group.categories : [];
              const normalizedCategories =
                categories.length > 0
                  ? categories
                  : groupItems.length > 0
                    ? [{ title: "", items: groupItems }]
                    : [];
              return {
                ...group,
                categories: normalizedCategories.map((category: any) => ({
                  ...category,
                  items: (Array.isArray(category.items) ? category.items : []).map((item: any) => ({
                    ...item,
                    image: normalizeMedia(item.image as MediaValue)
                  }))
                })),
                items: []
              };
            })
          : items.length > 0
            ? [
                {
                  title: "",
                  categories: [
                    {
                      title: "",
                      items
                    }
                  ],
                  items: []
                }
              ]
            : [];
      return {
        ...section,
        groups: normalizedGroups,
        items: []
      };
    }
    if (section.blockType === "gallery") {
      const images = Array.isArray(section.images) ? section.images : [];
      return {
        ...section,
        images: images.map((image: any) => ({
          ...image,
          image: normalizeMedia(image.image as MediaValue)
        }))
      };
    }
    return section;
  });

export const EspaceProClient = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({ email: "", password: "" });

  const [sites, setSites] = useState<ProSite[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [activeSiteId, setActiveSiteId] = useState<string | number | null>(null);
  const [draftSite, setDraftSite] = useState<ProSite | null>(null);
  const [activePageKey, setActivePageKey] =
    useState<keyof ProSitePages>("home");
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [newSectionType, setNewSectionType] =
    useState<ProSection["blockType"]>("about");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openServiceGroups, setOpenServiceGroups] = useState<Record<string, boolean>>({});
  const [openServiceCategories, setOpenServiceCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        if (!isActive) return;
        setUser(currentUser);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setIsAuthLoading(false);
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    if (!user?.id) return;
    const loadPages = async () => {
      setIsLoadingPages(true);
      setMessage(null);
      try {
        const result = await fetchSites(user.id);
        if (!isActive) return;
        const normalized = result.map((site) => normalizeSite(site));
        setSites(normalized);
        if (normalized.length > 0) {
          setActiveSiteId(normalized[0].id);
          setDraftSite(clone(normalized[0]));
          setActivePageKey("home");
          setActiveSectionIndex(0);
        }
      } catch (err) {
        if (isActive) {
          setMessage(err instanceof Error ? err.message : "Chargement impossible.");
        }
      } finally {
        if (isActive) setIsLoadingPages(false);
      }
    };
    loadPages();
    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const activeSite = useMemo(
    () => sites.find((page) => String(page.id) === String(activeSiteId)) ?? null,
    [sites, activeSiteId]
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formState)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.errors?.[0]?.message || data?.message || "Identifiants invalides.";
        setError(message);
        return;
      }
      const data = await response.json();
      const nextUser = (data?.user ?? null) as User | null;
      setUser(nextUser);
      setFormState({ email: "", password: "" });
    } catch {
      setError("Connexion impossible. Reessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      setSites([]);
      setDraftSite(null);
      setActiveSiteId(null);
    } catch {
      setError("Deconnexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPage = (site: ProSite) => {
    const normalized = normalizeSite(site);
    setActiveSiteId(normalized.id);
    setDraftSite(clone(normalized));
    setActivePageKey("home");
    setActiveSectionIndex(0);
    setMessage(null);
    setShowPreview(false);
  };

  const updateDraft = (patch: Partial<ProSite>) => {
    setDraftSite((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updatePage = (key: keyof ProSitePages, patch: Partial<ProSitePage>) => {
    setDraftSite((prev) => {
      if (!prev) return prev;
      const pages = { ...(prev.pages ?? {}) } as ProSitePages;
      const page = { ...(pages[key] ?? {}) } as ProSitePage;
      pages[key] = { ...page, ...patch };
      return { ...prev, pages };
    });
  };

  const updateActivePage = (patch: Partial<ProSitePage>) => {
    updatePage(activePageKey, patch);
  };

  const updateSection = (
    index: number,
    updater: ProSection | ((section: ProSection) => ProSection)
  ) => {
    setDraftSite((prev) => {
      if (!prev) return prev;
      const pages = { ...(prev.pages ?? {}) } as ProSitePages;
      const page = { ...(pages[activePageKey] ?? {}) } as ProSitePage;
      const sections = [...(page.sections ?? [])];
      const current = sections[index] ?? buildEmptySection("about");
      const next =
        typeof updater === "function" ? updater(current) : { ...current, ...updater };
      sections[index] = next;
      page.sections = sections;
      pages[activePageKey] = page;
      return { ...prev, pages };
    });
  };

  const updateSectionField = (index: number, field: string, value: unknown) => {
    updateSection(index, (section) => ({ ...section, [field]: value }));
  };

  const updateSectionItem = (
    index: number,
    field: string,
    itemIndex: number,
    patch: Record<string, unknown>
  ) => {
    updateSection(index, (section) => {
      const list = Array.isArray(section[field]) ? [...(section[field] as any[])] : [];
      list[itemIndex] = { ...(list[itemIndex] ?? {}), ...patch };
      return { ...section, [field]: list };
    });
  };

  const addSectionItem = (index: number, field: string, item: Record<string, unknown>) => {
    updateSection(index, (section) => {
      const list = Array.isArray(section[field]) ? [...(section[field] as any[])] : [];
      list.push(item);
      return { ...section, [field]: list };
    });
  };

  const removeSectionItem = (index: number, field: string, itemIndex: number) => {
    updateSection(index, (section) => {
      const list = Array.isArray(section[field]) ? [...(section[field] as any[])] : [];
      list.splice(itemIndex, 1);
      return { ...section, [field]: list };
    });
  };

  const normalizeServiceCategories = (group: Record<string, unknown>) => {
    const categories = Array.isArray((group as any).categories)
      ? [ ...((group as any).categories as Record<string, unknown>[]) ]
      : [];
    if (categories.length > 0) return categories;
    const items = Array.isArray((group as any).items)
      ? [ ...((group as any).items as Record<string, unknown>[]) ]
      : [];
    if (items.length === 0) return [];
    return [{ title: "", items }];
  };

  const getServiceGroups = (section: ProSection) => {
    const groups = Array.isArray(section.groups)
      ? [...(section.groups as Record<string, unknown>[])]
      : [];
    if (groups.length > 0) {
      return groups.map((group) => ({
        ...group,
        categories: normalizeServiceCategories(group)
      }));
    }
    const items = Array.isArray(section.items)
      ? [...(section.items as Record<string, unknown>[])]
      : [];
    if (items.length === 0) return [];
    return [{ title: "", categories: [{ title: "", items }] }];
  };

  const updateServiceGroups = (
    index: number,
    updater: (groups: Record<string, unknown>[]) => Record<string, unknown>[]
  ) => {
    updateSection(index, (section) => {
      const nextGroups = updater(getServiceGroups(section));
      return { ...section, groups: nextGroups, items: [] };
    });
  };

  const toggleServiceGroup = (key: string) => {
    setOpenServiceGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleServiceCategory = (key: string) => {
    setOpenServiceCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addServiceGroup = (index: number) => {
    updateServiceGroups(index, (groups) => [
      ...groups,
      { title: "", categories: [] }
    ]);
  };

  const removeServiceGroup = (index: number, groupIndex: number) => {
    updateServiceGroups(index, (groups) => groups.filter((_, idx) => idx !== groupIndex));
  };

  const updateServiceGroupField = (
    index: number,
    groupIndex: number,
    field: string,
    value: unknown
  ) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = next[groupIndex] ?? {};
      next[groupIndex] = { ...current, [field]: value };
      return next;
    });
  };

  const addServiceCategory = (index: number, groupIndex: number) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = (next[groupIndex] ?? { title: "", categories: [] }) as any;
      const categories = Array.isArray(current.categories)
        ? [...current.categories]
        : [];
      categories.push({ title: "", items: [] });
      next[groupIndex] = { ...current, categories };
      return next;
    });
  };

  const removeServiceCategory = (
    index: number,
    groupIndex: number,
    categoryIndex: number
  ) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = (next[groupIndex] ?? { title: "", categories: [] }) as any;
      const categories = Array.isArray(current.categories)
        ? [...current.categories]
        : [];
      categories.splice(categoryIndex, 1);
      next[groupIndex] = { ...current, categories };
      return next;
    });
  };

  const updateServiceCategoryField = (
    index: number,
    groupIndex: number,
    categoryIndex: number,
    field: string,
    value: unknown
  ) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = (next[groupIndex] ?? { title: "", categories: [] }) as any;
      const categories = Array.isArray(current.categories)
        ? [...current.categories]
        : [];
      const category = categories[categoryIndex] ?? {};
      categories[categoryIndex] = { ...category, [field]: value };
      next[groupIndex] = { ...current, categories };
      return next;
    });
  };

  const addServiceCategoryItem = (
    index: number,
    groupIndex: number,
    categoryIndex: number,
    item: Record<string, unknown>
  ) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = (next[groupIndex] ?? { title: "", categories: [] }) as any;
      const categories = Array.isArray(current.categories)
        ? [...current.categories]
        : [];
      const category = categories[categoryIndex] ?? { title: "", items: [] };
      const items = Array.isArray(category.items) ? [...category.items] : [];
      items.push(item);
      categories[categoryIndex] = { ...category, items };
      next[groupIndex] = { ...current, categories };
      return next;
    });
  };

  const updateServiceCategoryItem = (
    index: number,
    groupIndex: number,
    categoryIndex: number,
    itemIndex: number,
    patch: Record<string, unknown>
  ) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = (next[groupIndex] ?? { title: "", categories: [] }) as any;
      const categories = Array.isArray(current.categories)
        ? [...current.categories]
        : [];
      const category = categories[categoryIndex] ?? { title: "", items: [] };
      const items = Array.isArray(category.items) ? [...category.items] : [];
      items[itemIndex] = { ...(items[itemIndex] ?? {}), ...patch };
      categories[categoryIndex] = { ...category, items };
      next[groupIndex] = { ...current, categories };
      return next;
    });
  };

  const removeServiceCategoryItem = (
    index: number,
    groupIndex: number,
    categoryIndex: number,
    itemIndex: number
  ) => {
    updateServiceGroups(index, (groups) => {
      const next = [...groups];
      const current = (next[groupIndex] ?? { title: "", categories: [] }) as any;
      const categories = Array.isArray(current.categories)
        ? [...current.categories]
        : [];
      const category = categories[categoryIndex] ?? { title: "", items: [] };
      const items = Array.isArray(category.items) ? [...category.items] : [];
      items.splice(itemIndex, 1);
      categories[categoryIndex] = { ...category, items };
      next[groupIndex] = { ...current, categories };
      return next;
    });
  };

  const addSection = () => {
    setDraftSite((prev) => {
      if (!prev) return prev;
      const pages = { ...(prev.pages ?? {}) } as ProSitePages;
      const page = { ...(pages[activePageKey] ?? {}) } as ProSitePage;
      const sections = [...(page.sections ?? []), buildEmptySection(newSectionType)];
      page.sections = sections;
      pages[activePageKey] = page;
      setActiveSectionIndex(sections.length - 1);
      return { ...prev, pages };
    });
  };

  const moveSection = (index: number, direction: number) => {
    setDraftSite((prev) => {
      if (!prev) return prev;
      const pages = { ...(prev.pages ?? {}) } as ProSitePages;
      const page = { ...(pages[activePageKey] ?? {}) } as ProSitePage;
      const sections = [...(page.sections ?? [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= sections.length) return prev;
      const [removed] = sections.splice(index, 1);
      sections.splice(nextIndex, 0, removed);
      page.sections = sections;
      pages[activePageKey] = page;
      setActiveSectionIndex(nextIndex);
      return { ...prev, pages };
    });
  };

  const removeSection = (index: number) => {
    if (!window.confirm("Supprimer cette section ?")) return;
    setDraftSite((prev) => {
      if (!prev) return prev;
      const pages = { ...(prev.pages ?? {}) } as ProSitePages;
      const page = { ...(pages[activePageKey] ?? {}) } as ProSitePage;
      const sections = [...(page.sections ?? [])];
      sections.splice(index, 1);
      page.sections = sections;
      pages[activePageKey] = page;
      return { ...prev, pages };
    });
    setActiveSectionIndex(0);
  };

  const moveMenuItem = (key: keyof ProSitePages, direction: number) => {
    if (key === "home") return;
    setDraftSite((prev) => {
      if (!prev) return prev;
      const pages = { ...(prev.pages ?? {}) } as ProSitePages;
      const keys = pageKeys.filter((pageKey) => pageKey !== "home");
      const ordered = keys
        .map((pageKey) => {
          const page = pages[pageKey] ?? {};
          const order = (page.navOrder ?? defaultNavOrder[pageKey]) as number;
          return { key: pageKey, order };
        })
        .sort((a, b) => a.order - b.order);
      const currentIndex = ordered.findIndex((item) => item.key === key);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) {
        return prev;
      }
      const targetKey = ordered[nextIndex].key;
      const currentPage = { ...(pages[key] ?? {}) } as ProSitePage;
      const targetPage = { ...(pages[targetKey] ?? {}) } as ProSitePage;
      const currentOrder = currentPage.navOrder ?? defaultNavOrder[key];
      const targetOrder = targetPage.navOrder ?? defaultNavOrder[targetKey];
      pages[key] = { ...currentPage, navOrder: targetOrder };
      pages[targetKey] = { ...targetPage, navOrder: currentOrder };
      return { ...prev, pages };
    });
  };

  const validateServiceSubsections = (pages?: ProSitePages | null) => {
    return null;
  };

  const handleSave = async () => {
    if (!draftSite) return;
    const validationMessage = validateServiceSubsections(draftSite.pages ?? null);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const pages = draftSite.pages ?? {};
      const serializedPages: ProSitePages = {
        home: pages.home
          ? { ...pages.home, sections: serializeSections(pages.home.sections ?? []) }
          : pages.home,
        services: pages.services
          ? { ...pages.services, sections: serializeSections(pages.services.sections ?? []) }
          : pages.services,
        gallery: pages.gallery
          ? { ...pages.gallery, sections: serializeSections(pages.gallery.sections ?? []) }
          : pages.gallery,
        team: pages.team
          ? { ...pages.team, sections: serializeSections(pages.team.sections ?? []) }
          : pages.team,
        contact: pages.contact
          ? { ...pages.contact, sections: serializeSections(pages.contact.sections ?? []) }
          : pages.contact
      };
      const payload = {
        name: draftSite.name,
        theme: draftSite.theme,
        palette: draftSite.palette,
        typo: draftSite.typo,
        pages: serializedPages
      };
      const response = await fetch(`/api/pro-pages/${draftSite.id}?depth=2`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Enregistrement impossible.");
      }
      const data = await response.json();
      const updated = (data?.doc ?? data) as ProSite;
      setSites((prev) =>
        prev.map((item) => (String(item.id) === String(updated.id) ? updated : item))
      );
      setDraftSite(clone(updated));
      setMessage("Enregistre.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!draftSite) return;
    const nextStatus = draftSite.status === "published" ? "draft" : "published";
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/pro-pages/${draftSite.id}?depth=2`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) {
        throw new Error("Mise a jour impossible.");
      }
      const data = await response.json();
      const updated = (data?.doc ?? data) as ProSite;
      setSites((prev) =>
        prev.map((item) => (String(item.id) === String(updated.id) ? updated : item))
      );
      setDraftSite(clone(updated));
      setMessage("Statut mis a jour.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Mise a jour impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (
    onComplete: (value: MediaValue) => void,
    file?: File | null
  ) => {
    if (!file) return;
    setIsUploading(true);
    setMessage(null);
    try {
      const uploaded = await uploadMedia(file);
      onComplete(uploaded);
      setMessage("Image ajoutee.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      setIsUploading(false);
    }
  };

  const activePageContent = draftSite?.pages?.[activePageKey] ?? null;
  const activeSections = activePageContent?.sections ?? [];
  const activeSiteValue = activeSiteId ? String(activeSiteId) : "";
  const activePageHeader = {
    ...buildDefaultHeader(activePageKey),
    ...(activePageContent?.header ?? {})
  };
  const activePagePath = pagePathMap[activePageKey];
  const siteLabels = pageLabelMap[draftSite?.type ?? "prestataire"];
  const pageMetaByKey = pageKeys.reduce(
    (acc, key) => {
      const page = draftSite?.pages?.[key] ?? null;
      acc[key] = {
        label: page?.navLabel ?? siteLabels[key],
        navEnabled:
          key === "home" ? true : (page?.navEnabled ?? defaultNavEnabled[key]),
        navOrder: key === "home" ? 0 : (page?.navOrder ?? defaultNavOrder[key])
      };
      return acc;
    },
    {} as Record<keyof ProSitePages, { label: string; navEnabled: boolean; navOrder: number }>
  );
  const menuItems = pageKeys
    .map((key) => ({ key, ...pageMetaByKey[key] }))
    .sort((a, b) => a.navOrder - b.navOrder);
  const reorderableMenuItems = menuItems.filter((item) => item.key !== "home");
  const activePaletteOption =
    paletteOptions.find((option) => option.value === (draftSite?.palette ?? "ocean")) ??
    paletteOptions[0];
  const activeTypoOption =
    typoOptions.find((option) => option.value === (draftSite?.typo ?? "fraunces-source")) ??
    typoOptions[0];

  if (isAuthLoading) {
    return <p className="text-sm text-slate">Chargement...</p>;
  }

  if (!user) {
    return (
      <Card className="p-6 max-w-lg">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
            Acces pro
          </p>
          <h2 className="text-2xl font-display text-ink">Connexion</h2>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block text-sm font-semibold text-ink/80">
            Email
            <input
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
              className="mt-2 w-full glass-input"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-ink/80">
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
              className="mt-2 w-full glass-input"
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink">
        <div>
          <p className="font-semibold">{user.name || user.email}</p>
          <p className="text-xs text-slate">Espace pro</p>
        </div>
        <div className="min-w-[220px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate">
            Vos sites
          </p>
          {isLoadingPages ? (
            <p className="mt-1 text-xs text-slate">Chargement...</p>
          ) : sites.length === 0 ? (
            <p className="mt-1 text-xs text-slate">Aucun site attribue.</p>
          ) : (
            <select
              value={activeSiteValue}
              onChange={(event) => {
                const next = sites.find(
                  (site) => String(site.id) === String(event.target.value)
                );
                if (next) selectPage(next);
              }}
              className="mt-1 w-full glass-input text-sm"
            >
              {sites.map((site) => (
                <option key={String(site.id)} value={String(site.id)}>
                  {site.name || site.slug || "Site pro"}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSubmitting}
          className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Deconnexion
        </button>
      </div>

      <div className="space-y-6">
        {isLoadingPages ? (
          <Card className="p-6 text-sm text-slate">Chargement...</Card>
        ) : null}
        {draftSite ? (
          <>
              <Card className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-display text-ink">
                      {draftSite.name || "Site pro"}
                    </h2>
                    <p className="text-xs text-slate">/pro/{draftSite.slug}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      draftSite.status === "published"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {draftSite.status === "published" ? "Publie" : "Brouillon"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.18em]">
                  <a
                    className="rounded-full border border-ink/10 px-3 py-1.5 text-ink/70 transition hover:border-ink/30 hover:text-ink"
                    href={
                      activePagePath
                        ? `/pro/${draftSite.slug}/${activePagePath}`
                        : `/pro/${draftSite.slug}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir
                  </a>
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={isSaving}
                    className="rounded-full border border-ink/10 px-3 py-1.5 text-ink/70 transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {draftSite.status === "published" ? "Depublier" : "Publier"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-full border border-ink/10 px-3 py-1.5 text-ink/70 transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Sauvegarde..." : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview((prev) => !prev)}
                    className="rounded-full border border-ink/10 px-3 py-1.5 text-ink/70 transition hover:border-ink/30 hover:text-ink"
                  >
                    {showPreview ? "Masquer l'aperçu" : "Aperçu"}
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                      Nom
                    </span>
                    <input
                      value={draftSite.name ?? ""}
                      onChange={(event) => updateDraft({ name: event.target.value })}
                      className="w-full glass-input"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                      Theme
                    </span>
                    <select
                      value={draftSite.theme ?? "moderne"}
                      onChange={(event) =>
                        updateDraft({ theme: event.target.value as ProSite["theme"] })
                      }
                      className="w-full glass-input"
                    >
                      <option value="moderne">Moderne</option>
                      <option value="chaleureux">Chaleureux</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                      Palette
                    </span>
                    <select
                      value={draftSite.palette ?? "ocean"}
                      onChange={(event) =>
                        updateDraft({ palette: event.target.value as ProSite["palette"] })
                      }
                      className="w-full glass-input"
                      style={{
                        backgroundColor: activePaletteOption.bg,
                        color: activePaletteOption.text,
                        backgroundImage: `linear-gradient(90deg, ${activePaletteOption.accent} 0 14px, ${activePaletteOption.bg} 14px)`,
                        backgroundRepeat: "no-repeat"
                      }}
                    >
                      {paletteOptions.map((palette) => (
                        <option
                          key={palette.value}
                          value={palette.value}
                          style={{
                            backgroundColor: palette.bg,
                            color: palette.text,
                            backgroundImage: `linear-gradient(90deg, ${palette.accent} 0 14px, ${palette.bg} 14px)`
                          }}
                        >
                          {palette.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                      Typo
                    </span>
                    <select
                      value={draftSite.typo ?? "fraunces-source"}
                      onChange={(event) =>
                        updateDraft({ typo: event.target.value as ProSite["typo"] })
                      }
                      className="w-full glass-input"
                      style={{ fontFamily: activeTypoOption.fontFamily }}
                    >
                      {typoOptions.map((typo) => (
                        <option
                          key={typo.value}
                          value={typo.value}
                          style={{ fontFamily: typo.fontFamily }}
                        >
                          {typo.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                    Pages du site
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pageKeys.map((key) => {
                      const pageMeta = pageMetaByKey[key];
                      return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setActivePageKey(key);
                          setActiveSectionIndex(0);
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                          activePageKey === key
                            ? "border-gold/40 bg-gold/10 text-ink"
                            : "border-ink/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink"
                        } ${pageMeta.navEnabled ? "" : "opacity-50"}`}
                      >
                        {pageMeta.label}
                      </button>
                    );
                    })}
                  </div>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                      Titre de page
                    </span>
                    <input
                      value={activePageContent?.title ?? ""}
                      onChange={(event) => updateActivePage({ title: event.target.value })}
                      className="w-full glass-input"
                    />
                  </label>
                  {activePageKey !== "home" ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate">
                        <input
                          type="checkbox"
                          checked={Boolean(activePageHeader.enabled)}
                          onChange={(event) =>
                            updateActivePage({
                              header: {
                                ...activePageHeader,
                                enabled: event.target.checked
                              }
                            })
                          }
                          className="h-4 w-4 rounded border-ink/20 text-ink focus:ring-gold/30"
                        />
                        Afficher le titre
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                          Alignement
                        </span>
                        <select
                          value={activePageHeader.align ?? "left"}
                          onChange={(event) =>
                            updateActivePage({
                              header: {
                                ...activePageHeader,
                                align: event.target.value as ProPageHeader["align"]
                              }
                            })
                          }
                          disabled={!activePageHeader.enabled}
                          className="w-full glass-input"
                        >
                          <option value="left">Gauche</option>
                          <option value="center">Centre</option>
                        </select>
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                          Style
                        </span>
                        <select
                          value={activePageHeader.variant ?? "simple"}
                          onChange={(event) =>
                            updateActivePage({
                              header: {
                                ...activePageHeader,
                                variant: event.target.value as ProPageHeader["variant"]
                              }
                            })
                          }
                          disabled={!activePageHeader.enabled}
                          className="w-full glass-input"
                        >
                          <option value="simple">Simple</option>
                          <option value="accent">Accent</option>
                        </select>
                      </label>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                      Menu du site
                    </p>
                    <div className="space-y-2">
                      {menuItems.map((item) => {
                        const orderIndex = reorderableMenuItems.findIndex(
                          (entry) => entry.key === item.key
                        );
                        const isHome = item.key === "home";
                        const isFirst = orderIndex <= 0;
                        const isLast = orderIndex === reorderableMenuItems.length - 1;
                        return (
                          <div
                            key={`menu-${item.key}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2 text-xs"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate">
                                <input
                                  type="checkbox"
                                  checked={item.navEnabled}
                                  onChange={(event) =>
                                    updatePage(item.key, {
                                      navEnabled: event.target.checked
                                    })
                                  }
                                  disabled={isHome}
                                  className="h-4 w-4 rounded border-ink/20 text-ink focus:ring-gold/30 disabled:opacity-60"
                                />
                                {isHome ? "Toujours visible" : "Visible"}
                              </label>
                              <input
                                value={item.label}
                                onChange={(event) =>
                                  updatePage(item.key, { navLabel: event.target.value })
                                }
                                className="w-44 min-w-[160px] glass-input py-2"
                              />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-slate">
                              <button
                                type="button"
                                onClick={() => moveMenuItem(item.key, -1)}
                                disabled={isHome || isFirst}
                                className="px-2 py-1 disabled:opacity-40"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveMenuItem(item.key, 1)}
                                disabled={isHome || isLast}
                                className="px-2 py-1 disabled:opacity-40"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                    Sections
                  </p>
                  <div className="space-y-2">
                    {activeSections.map((section, index) => (
                      <div
                        key={section.id ?? `${section.blockType}-${index}`}
                        className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                          index === activeSectionIndex
                            ? "border-gold/40 bg-gold/10 text-ink"
                            : "border-ink/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveSectionIndex(index)}
                          className="flex-1 text-left space-y-1"
                        >
                          <p className="font-semibold">{sectionLabels[section.blockType]}</p>
                          <p className="text-xs text-slate">{getSectionSummary(section)}</p>
                        </button>
                        <div className="flex gap-1 text-[10px] uppercase tracking-[0.2em] text-slate">
                          <button
                            type="button"
                            onClick={() => moveSection(index, -1)}
                            className="px-2 py-1"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, 1)}
                            className="px-2 py-1"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="px-2 py-1 text-rose-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <select
                      value={newSectionType}
                      onChange={(event) =>
                        setNewSectionType(event.target.value as ProSection["blockType"])
                      }
                      className="w-full glass-input text-sm"
                    >
                      <option value="hero">Hero</option>
                      <option value="about">Bloc de texte</option>
                      <option value="services">Services / Menu</option>
                      <option value="gallery">Galerie</option>
                      <option value="pricing">Tarifs</option>
                      <option value="contact">Contact</option>
                    </select>
                    <button
                      type="button"
                      onClick={addSection}
                      className="w-full rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                    >
                      Ajouter une section
                    </button>
                  </div>
                </div>
                {message ? <p className="text-xs text-slate">{message}</p> : null}
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  {(() => {
                    const section = activeSections[activeSectionIndex];
                    if (!section) {
                      return <p className="text-sm text-slate">Selectionnez une section.</p>;
                    }

                    if (section.blockType === "hero") {
                      const bannerUrl = getMediaUrl(section.bannerImage as MediaValue);
                      const logoUrl = getMediaUrl(section.logo as MediaValue);
                      return (
                        <div className="space-y-4 text-sm">
                          <h3 className="text-base font-semibold">Hero</h3>
                          <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                              Titre
                            </span>
                            <input
                              value={(section.title as string) ?? ""}
                              onChange={(event) =>
                                updateSectionField(activeSectionIndex, "title", event.target.value)
                              }
                              className="w-full glass-input"
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                              Sous-titre
                            </span>
                            <textarea
                              value={(section.subtitle as string) ?? ""}
                              onChange={(event) =>
                                updateSectionField(
                                  activeSectionIndex,
                                  "subtitle",
                                  event.target.value
                                )
                              }
                              className="w-full glass-input min-h-[110px]"
                            />
                          </label>
                          <div className="grid gap-3 md:grid-cols-3">
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Alignement
                              </span>
                              <select
                                value={(section.align as string) ?? "left"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "align",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="left">Gauche</option>
                                <option value="center">Centre</option>
                              </select>
                            </label>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Couleur du texte
                              </span>
                              <select
                                value={(section.textTone as string) ?? "light"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "textTone",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="light">Clair</option>
                                <option value="dark">Sombre</option>
                              </select>
                            </label>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Hauteur
                              </span>
                              <select
                                value={(section.height as string) ?? "md"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "height",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="sm">Compact</option>
                                <option value="md">Moyen</option>
                                <option value="lg">Grand</option>
                              </select>
                            </label>
                          </div>
                          <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                              Opacite du voile
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={80}
                              value={Number(section.overlay ?? 40)}
                              onChange={(event) =>
                                updateSectionField(
                                  activeSectionIndex,
                                  "overlay",
                                  Number(event.target.value)
                                )
                              }
                              className="w-full glass-input"
                            />
                          </label>
                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Bouton principal (texte)
                              </span>
                              <input
                                value={(section.primaryCtaLabel as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "primaryCtaLabel",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Bouton principal (lien)
                              </span>
                              <input
                                value={(section.primaryCtaUrl as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "primaryCtaUrl",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Bouton secondaire (texte)
                              </span>
                              <input
                                value={(section.secondaryCtaLabel as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "secondaryCtaLabel",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Bouton secondaire (lien)
                              </span>
                              <input
                                value={(section.secondaryCtaUrl as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "secondaryCtaUrl",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              />
                            </label>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Image de banniere
                              </p>
                              {bannerUrl ? (
                                <img
                                  src={bannerUrl}
                                  alt="Banniere"
                                  className="h-32 w-full rounded-2xl object-cover"
                                />
                              ) : (
                                <p className="text-xs text-slate">Aucune image.</p>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  handleUpload(
                                    (value) =>
                                      updateSectionField(
                                        activeSectionIndex,
                                        "bannerImage",
                                        value
                                      ),
                                    file
                                  );
                                  event.currentTarget.value = "";
                                }}
                                className="text-xs"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Logo
                              </p>
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt="Logo"
                                  className="h-24 w-24 rounded-2xl object-cover"
                                />
                              ) : (
                                <p className="text-xs text-slate">Aucun logo.</p>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  handleUpload(
                                    (value) =>
                                      updateSectionField(activeSectionIndex, "logo", value),
                                    file
                                  );
                                  event.currentTarget.value = "";
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                      if (section.blockType === "about") {
                        const imageUrl = getMediaUrl(section.image as MediaValue);
                        return (
                          <div className="space-y-4 text-sm">
                            <h3 className="text-base font-semibold">Bloc de texte</h3>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Titre
                              </span>
                              <input
                                value={(section.title as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(activeSectionIndex, "title", event.target.value)
                                }
                                className="w-full glass-input"
                              />
                            </label>
                            <div className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Texte
                              </span>
                              <RichTextEditor
                                value={(section.body as string) ?? ""}
                                onChange={(next) =>
                                  updateSectionField(activeSectionIndex, "body", next)
                                }
                              />
                            </div>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Position de l'image
                              </span>
                              <select
                                value={(section.imagePosition as string) ?? "left"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "imagePosition",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="left">Gauche</option>
                                <option value="right">Droite</option>
                              </select>
                            </label>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Image
                              </p>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt="Illustration"
                                  className="h-32 w-full rounded-2xl object-cover"
                                />
                              ) : (
                                <p className="text-xs text-slate">Aucune image.</p>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  handleUpload(
                                    (value) =>
                                      updateSectionField(activeSectionIndex, "image", value),
                                    file
                                  );
                                  event.currentTarget.value = "";
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        );
                      }

                      if (section.blockType === "services") {
                        const groups = getServiceGroups(section);
                        return (
                          <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-semibold">Services / Menu</h3>
                              <button
                                type="button"
                                onClick={() => addServiceGroup(activeSectionIndex)}
                                className="rounded-full border border-ink/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                              >
                                Ajouter une section
                              </button>
                            </div>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Variante
                              </span>
                              <select
                                value={(section.variant as string) ?? "list"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "variant",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="list">Liste</option>
                                <option value="cards">Cartes</option>
                              </select>
                            </label>
                            <div className="space-y-4">
                              {groups.map((group, groupIndex) => {
                                const categories = Array.isArray((group as any).categories)
                                  ? ((group as any).categories as any[])
                                  : [];
                                const groupKey = `${activeSectionIndex}-${groupIndex}`;
                                const groupOpen = openServiceGroups[groupKey] ?? false;
                                return (
                                  <div
                                    key={`group-${groupIndex}`}
                                    className="space-y-3 rounded-2xl border border-ink/10 bg-white/70 p-3"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <input
                                        value={(group as any)?.title ?? ""}
                                        onChange={(event) =>
                                          updateServiceGroupField(
                                            activeSectionIndex,
                                            groupIndex,
                                            "title",
                                            event.target.value
                                          )
                                        }
                                        className="w-full glass-input"
                                        placeholder="Nom de section"
                                      />
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleServiceGroup(groupKey)}
                                          className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                        >
                                          {groupOpen ? "Replier" : "Déplier"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeServiceGroup(activeSectionIndex, groupIndex)
                                          }
                                          className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                        >
                                          Supprimer
                                        </button>
                                      </div>
                                    </div>
                                    {groupOpen ? (
                                      <>
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                            Sous-sections
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addServiceCategory(activeSectionIndex, groupIndex)
                                            }
                                            className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                          >
                                            Ajouter une sous-section
                                          </button>
                                        </div>
                                        {categories.map((category, categoryIndex) => {
                                          const items = Array.isArray(category?.items)
                                            ? (category.items as any[])
                                            : [];
                                          const categoryKey = `${activeSectionIndex}-${groupIndex}-${categoryIndex}`;
                                          const categoryOpen =
                                            openServiceCategories[categoryKey] ?? false;
                                          return (
                                            <div
                                              key={`category-${groupIndex}-${categoryIndex}`}
                                              className="space-y-3 rounded-2xl border border-ink/10 bg-white/70 p-3"
                                            >
                                              <div className="flex items-center justify-between gap-2">
                                                <input
                                                  value={category?.title ?? ""}
                                                  onChange={(event) =>
                                                    updateServiceCategoryField(
                                                      activeSectionIndex,
                                                      groupIndex,
                                                      categoryIndex,
                                                      "title",
                                                      event.target.value
                                                    )
                                                  }
                                                  className="w-full glass-input"
                                                  placeholder="Nom de sous-section"
                                                />
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      toggleServiceCategory(categoryKey)
                                                    }
                                                    className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                                  >
                                                    {categoryOpen ? "Replier" : "Déplier"}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      removeServiceCategory(
                                                        activeSectionIndex,
                                                        groupIndex,
                                                        categoryIndex
                                                      )
                                                    }
                                                    className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                                  >
                                                    Supprimer
                                                  </button>
                                                </div>
                                              </div>
                                              {categoryOpen ? (
                                                <>
                                                  <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                                      Elements
                                                    </p>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        addServiceCategoryItem(
                                                          activeSectionIndex,
                                                          groupIndex,
                                                          categoryIndex,
                                                          {
                                                            image: null,
                                                            name: "",
                                                            description: "",
                                                            price: ""
                                                          }
                                                        )
                                                      }
                                                      className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                                    >
                                                      Ajouter
                                                    </button>
                                                  </div>
                                                  {items.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                      <div className="min-w-[820px] space-y-2">
                                                        <div className="grid grid-cols-[minmax(180px,1.1fr)_minmax(220px,2fr)_120px_160px_90px] gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
                                                          <span>Nom</span>
                                                          <span>Description</span>
                                                          <span>Prix</span>
                                                          <span>Image</span>
                                                          <span />
                                                        </div>
                                                        {items.map((item, itemIndex) => {
                                                          const imageUrl = getMediaUrl(
                                                            item?.image as MediaValue
                                                          );
                                                          return (
                                                            <div
                                                              key={`service-${groupIndex}-${categoryIndex}-${itemIndex}`}
                                                              className="grid grid-cols-[minmax(180px,1.1fr)_minmax(220px,2fr)_120px_160px_90px] items-start gap-2 rounded-2xl border border-ink/10 bg-white/70 p-3"
                                                            >
                                                              <input
                                                                value={item?.name ?? ""}
                                                                onChange={(event) =>
                                                                  updateServiceCategoryItem(
                                                                    activeSectionIndex,
                                                                    groupIndex,
                                                                    categoryIndex,
                                                                    itemIndex,
                                                                    { name: event.target.value }
                                                                  )
                                                                }
                                                                className="w-full glass-input"
                                                                placeholder="Nom"
                                                              />
                                                              <textarea
                                                                value={item?.description ?? ""}
                                                                onChange={(event) =>
                                                                  updateServiceCategoryItem(
                                                                    activeSectionIndex,
                                                                    groupIndex,
                                                                    categoryIndex,
                                                                    itemIndex,
                                                                    {
                                                                      description: event.target.value
                                                                    }
                                                                  )
                                                                }
                                                                className="w-full glass-input min-h-[80px]"
                                                                placeholder="Description"
                                                              />
                                                              <input
                                                                value={item?.price ?? ""}
                                                                onChange={(event) =>
                                                                  updateServiceCategoryItem(
                                                                    activeSectionIndex,
                                                                    groupIndex,
                                                                    categoryIndex,
                                                                    itemIndex,
                                                                    { price: event.target.value }
                                                                  )
                                                                }
                                                                className="w-full glass-input"
                                                                placeholder="Prix"
                                                              />
                                                              <div className="space-y-2">
                                                                {imageUrl ? (
                                                                  <img
                                                                    src={imageUrl}
                                                                    alt="Visuel"
                                                                    className="h-16 w-full rounded-xl object-cover"
                                                                  />
                                                                ) : (
                                                                  <p className="text-xs text-slate">
                                                                    Aucune image.
                                                                  </p>
                                                                )}
                                                                <input
                                                                  type="file"
                                                                  accept="image/*"
                                                                  onChange={(event) => {
                                                                    const file =
                                                                      event.target.files?.[0];
                                                                    handleUpload((value) => {
                                                                      updateServiceCategoryItem(
                                                                        activeSectionIndex,
                                                                        groupIndex,
                                                                        categoryIndex,
                                                                        itemIndex,
                                                                        { image: value }
                                                                      );
                                                                    }, file);
                                                                    event.currentTarget.value = "";
                                                                  }}
                                                                  className="text-xs"
                                                                />
                                                              </div>
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  removeServiceCategoryItem(
                                                                    activeSectionIndex,
                                                                    groupIndex,
                                                                    categoryIndex,
                                                                    itemIndex
                                                                  )
                                                                }
                                                                className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                                              >
                                                                Supprimer
                                                              </button>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <p className="text-xs text-slate">
                                                      Aucun element.
                                                    </p>
                                                  )}
                                                </>
                                              ) : null}
                                            </div>
                                          );
                                        })}
                                        {categories.length === 0 ? (
                                          <p className="text-xs text-slate">
                                            Aucune sous-section.
                                          </p>
                                        ) : null}
                                      </>
                                    ) : null}
                                  </div>
                                );
                              })}
                              {groups.length === 0 ? (
                                <p className="text-xs text-slate">Aucune section.</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      }

                      if (section.blockType === "gallery") {
                        const images = (section.images as any[]) ?? [];
                        return (
                          <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-semibold">Galerie</h3>
                              <button
                                type="button"
                                onClick={() =>
                                  addSectionItem(activeSectionIndex, "images", {
                                    image: null,
                                    alt: "",
                                    caption: ""
                                  })
                                }
                                className="rounded-full border border-ink/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                              >
                                Ajouter
                              </button>
                            </div>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Colonnes
                              </span>
                              <select
                                value={(section.columns as string) ?? "3"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "columns",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                              </select>
                            </label>
                            <div className="space-y-3">
                              {images.map((image, imageIndex) => {
                                const imageUrl = getMediaUrl(image?.image as MediaValue);
                                return (
                                  <div
                                    key={`gallery-${imageIndex}`}
                                    className="space-y-2 rounded-2xl border border-ink/10 bg-white/70 p-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                        Image {imageIndex + 1}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSectionItem(
                                            activeSectionIndex,
                                            "images",
                                            imageIndex
                                          )
                                        }
                                        className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt="Galerie"
                                        className="h-28 w-full rounded-2xl object-cover"
                                      />
                                    ) : (
                                      <p className="text-xs text-slate">Aucune image.</p>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        handleUpload((value) => {
                                          updateSectionItem(
                                            activeSectionIndex,
                                            "images",
                                            imageIndex,
                                            { image: value }
                                          );
                                        }, file);
                                        event.currentTarget.value = "";
                                      }}
                                      className="text-xs"
                                    />
                                    <input
                                      value={image?.alt ?? ""}
                                      onChange={(event) =>
                                        updateSectionItem(activeSectionIndex, "images", imageIndex, {
                                          alt: event.target.value
                                        })
                                      }
                                      className="w-full glass-input"
                                      placeholder="Texte alternatif"
                                    />
                                    <input
                                      value={image?.caption ?? ""}
                                      onChange={(event) =>
                                        updateSectionItem(activeSectionIndex, "images", imageIndex, {
                                          caption: event.target.value
                                        })
                                      }
                                      className="w-full glass-input"
                                      placeholder="Legende"
                                    />
                                  </div>
                                );
                              })}
                              {images.length === 0 ? (
                                <p className="text-xs text-slate">Aucune image.</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      }

                      if (section.blockType === "pricing") {
                        const offers = (section.offers as any[]) ?? [];
                        return (
                          <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-semibold">Tarifs</h3>
                              <button
                                type="button"
                                onClick={() =>
                                  addSectionItem(activeSectionIndex, "offers", {
                                    title: "",
                                    price: "",
                                    description: "",
                                    points: []
                                  })
                                }
                                className="rounded-full border border-ink/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                              >
                                Ajouter
                              </button>
                            </div>
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                                Variante
                              </span>
                              <select
                                value={(section.variant as string) ?? "cards"}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "variant",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                              >
                                <option value="table">Table</option>
                                <option value="cards">Cartes</option>
                              </select>
                            </label>
                            {offers.length > 0 ? (
                              <div className="overflow-x-auto">
                                <div className="min-w-[900px] space-y-2">
                                  <div className="grid grid-cols-[minmax(160px,1.1fr)_120px_minmax(220px,2fr)_minmax(220px,2fr)_90px] gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
                                    <span>Titre</span>
                                    <span>Prix</span>
                                    <span>Description</span>
                                    <span>Points</span>
                                    <span />
                                  </div>
                                  {offers.map((offer, offerIndex) => (
                                    <div
                                      key={`offer-${offerIndex}`}
                                      className="grid grid-cols-[minmax(160px,1.1fr)_120px_minmax(220px,2fr)_minmax(220px,2fr)_90px] items-start gap-2 rounded-2xl border border-ink/10 bg-white/70 p-3"
                                    >
                                      <input
                                        value={offer?.title ?? ""}
                                        onChange={(event) =>
                                          updateSectionItem(activeSectionIndex, "offers", offerIndex, {
                                            title: event.target.value
                                          })
                                        }
                                        className="w-full glass-input"
                                        placeholder="Titre"
                                      />
                                      <input
                                        value={offer?.price ?? ""}
                                        onChange={(event) =>
                                          updateSectionItem(activeSectionIndex, "offers", offerIndex, {
                                            price: event.target.value
                                          })
                                        }
                                        className="w-full glass-input"
                                        placeholder="Prix"
                                      />
                                      <textarea
                                        value={offer?.description ?? ""}
                                        onChange={(event) =>
                                          updateSectionItem(activeSectionIndex, "offers", offerIndex, {
                                            description: event.target.value
                                          })
                                        }
                                        className="w-full glass-input min-h-[80px]"
                                        placeholder="Description"
                                      />
                                      <div className="space-y-2">
                                        {(offer?.points ?? []).map((point: any, pointIndex: number) => (
                                          <div
                                            key={`point-${offerIndex}-${pointIndex}`}
                                            className="flex items-center gap-2"
                                          >
                                            <input
                                              value={point?.text ?? ""}
                                              onChange={(event) => {
                                                const points = Array.isArray(offer?.points)
                                                  ? [...offer.points]
                                                  : [];
                                                points[pointIndex] = {
                                                  ...(points[pointIndex] ?? {}),
                                                  text: event.target.value
                                                };
                                                updateSectionItem(
                                                  activeSectionIndex,
                                                  "offers",
                                                  offerIndex,
                                                  { points }
                                                );
                                              }}
                                              className="w-full glass-input"
                                              placeholder="Point"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const points = Array.isArray(offer?.points)
                                                  ? [...offer.points]
                                                  : [];
                                                points.splice(pointIndex, 1);
                                                updateSectionItem(
                                                  activeSectionIndex,
                                                  "offers",
                                                  offerIndex,
                                                  { points }
                                                );
                                              }}
                                              className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                            >
                                              Supprimer
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const points = Array.isArray(offer?.points)
                                              ? [...offer.points]
                                              : [];
                                            points.push({ text: "" });
                                            updateSectionItem(activeSectionIndex, "offers", offerIndex, {
                                              points
                                            });
                                          }}
                                          className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                        >
                                          Ajouter un point
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSectionItem(activeSectionIndex, "offers", offerIndex)
                                        }
                                        className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate">Aucune offre.</p>
                            )}
                          </div>
                        );
                      }

                      if (section.blockType === "contact") {
                        const hours = (section.hours as any[]) ?? [];
                        const socials = (section.socials as any[]) ?? [];
                        return (
                          <div className="space-y-4 text-sm">
                            <h3 className="text-base font-semibold">Contact</h3>
                            <div className="grid gap-3 md:grid-cols-2">
                              <input
                                value={(section.address as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "address",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Adresse"
                              />
                              <input
                                value={(section.postalCode as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "postalCode",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Code postal"
                              />
                              <input
                                value={(section.city as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "city",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Ville"
                              />
                              <input
                                value={(section.phone as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "phone",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Telephone"
                              />
                              <input
                                value={(section.email as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "email",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Email"
                              />
                              <input
                                value={(section.website as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "website",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Site web"
                              />
                              <input
                                value={(section.mapUrl as string) ?? ""}
                                onChange={(event) =>
                                  updateSectionField(
                                    activeSectionIndex,
                                    "mapUrl",
                                    event.target.value
                                  )
                                }
                                className="w-full glass-input"
                                placeholder="Lien carte"
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                  Horaires
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addSectionItem(activeSectionIndex, "hours", { line: "" })
                                  }
                                  className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                >
                                  Ajouter
                                </button>
                              </div>
                              {hours.map((hour, hourIndex) => (
                                <div key={`hour-${hourIndex}`} className="flex items-center gap-2">
                                  <input
                                    value={hour?.line ?? ""}
                                    onChange={(event) =>
                                      updateSectionItem(activeSectionIndex, "hours", hourIndex, {
                                        line: event.target.value
                                      })
                                    }
                                    className="w-full glass-input"
                                    placeholder="Lun-Ven 09:00-18:00"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSectionItem(activeSectionIndex, "hours", hourIndex)
                                    }
                                    className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                                  Reseaux
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addSectionItem(activeSectionIndex, "socials", {
                                      label: "",
                                      url: ""
                                    })
                                  }
                                  className="text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                >
                                  Ajouter
                                </button>
                              </div>
                              {socials.map((social, socialIndex) => (
                                <div
                                  key={`social-${socialIndex}`}
                                  className="grid gap-2 md:grid-cols-[140px_1fr_auto]"
                                >
                                  <input
                                    value={social?.label ?? ""}
                                    onChange={(event) =>
                                      updateSectionItem(activeSectionIndex, "socials", socialIndex, {
                                        label: event.target.value
                                      })
                                    }
                                    className="w-full glass-input"
                                    placeholder="Nom"
                                  />
                                  <input
                                    value={social?.url ?? ""}
                                    onChange={(event) =>
                                      updateSectionItem(activeSectionIndex, "socials", socialIndex, {
                                        url: event.target.value
                                      })
                                    }
                                    className="w-full glass-input"
                                    placeholder="Lien"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSectionItem(activeSectionIndex, "socials", socialIndex)
                                    }
                                    className="text-[10px] uppercase tracking-[0.2em] text-rose-600"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })()}
                </div>
              {isUploading ? (
                <p className="mt-4 text-xs text-slate">Upload en cours...</p>
              ) : null}
              </Card>
              {showPreview ? (
                <Card className="p-4">
                  <div className="pro-preview">
                    <ProPageRenderer site={draftSite} pageKey={activePageKey} />
                  </div>
                </Card>
              ) : null}
            </>
          ) : !isLoadingPages ? (
            <Card className="p-6 text-sm text-slate">Selectionnez un site.</Card>
          ) : null}
          {activeSite && !draftSite ? (
            <p className="text-xs text-slate">Chargement du site...</p>
          ) : null}
      </div>
    </div>
  );
};
