"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";

type UserItem = {
  id: string | number;
  name?: string | null;
  email?: string | null;
};

type ProPageItem = {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  type?: "association" | "restaurant" | "prestataire" | null;
  status?: "draft" | "published" | null;
  owner?: UserItem | string | number | null;
  theme?: string | null;
  palette?: string | null;
  typo?: string | null;
};

type ProPageResponse = {
  docs: ProPageItem[];
};

type FormState = {
  name: string;
  slug: string;
  type: "association" | "restaurant" | "prestataire";
  ownerId: string;
  theme: "moderne" | "chaleureux" | "minimal";
  palette: "ocean" | "terracotta" | "olive" | "sable" | "charcoal" | "bleu-nuit";
  typo: "fraunces-source" | "cormorant-work" | "bebas-dm";
  useTemplate: boolean;
};

const fetchProPages = async () => {
  const response = await fetch("/api/pro-pages?depth=1&limit=200&sort=-updatedAt", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = (await response.json()) as ProPageResponse;
  return data.docs ?? [];
};

const fetchUsers = async () => {
  const response = await fetch("/api/users?depth=0&limit=200&sort=name", {
    credentials: "include"
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.errors?.[0]?.message || data?.message || "Chargement impossible.";
    throw new Error(message);
  }
  const data = await response.json();
  return (data?.docs ?? []) as UserItem[];
};

const slugify = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  return slug.slice(0, 40);
};

const formatType = (type?: ProPageItem["type"]) => {
  if (type === "association") return "Association";
  if (type === "restaurant") return "Restaurant";
  if (type === "prestataire") return "Prestataire";
  return "—";
};

const buildTemplatePages = (type: FormState["type"]) => {
  if (type === "restaurant") {
    return {
      home: {
        title: "Accueil",
        sections: [
          {
            blockType: "hero",
            title: "Nom du restaurant",
            subtitle: "Cuisine italienne • Sur place et a emporter",
            align: "left",
            overlay: 40,
            height: "md"
          },
          {
            blockType: "about",
            title: "Notre cuisine",
            body: "Produits frais, recettes maison, ambiance conviviale.",
            imagePosition: "left"
          }
        ]
      },
      services: {
        title: "Menu",
        sections: [
          {
            blockType: "services",
            variant: "list",
            groups: [
              {
                title: "Entrees",
                categories: [
                  {
                    title: "Poissons",
                    items: [
                      { name: "Tartare de saumon", description: "Citron vert, aneth." }
                    ]
                  },
                  {
                    title: "Viande",
                    items: [
                      { name: "Carpaccio de boeuf", description: "Copeaux de parmesan." }
                    ]
                  }
                ]
              },
              {
                title: "Plats",
                categories: [
                  {
                    title: "Signature",
                    items: [
                      {
                        name: "Pizza Margherita",
                        description: "Tomate, mozzarella, basilic.",
                        price: "12.50"
                      }
                    ]
                  }
                ]
              },
              {
                title: "Desserts",
                categories: [
                  {
                    title: "",
                    items: [{ name: "Tiramisu", description: "Maison." }]
                  }
                ]
              }
            ]
          },
          {
            blockType: "pricing",
            variant: "cards",
            offers: [
              { title: "Menu midi", price: "14.90", description: "Entree + plat + boisson." },
              { title: "Menu soir", price: "19.90", description: "Entree + plat + dessert." }
            ]
          }
        ]
      },
      gallery: {
        title: "Galerie",
        sections: [
          {
            blockType: "gallery",
            columns: "3",
            images: []
          }
        ]
      },
      team: {
        title: "Equipe",
        sections: []
      },
      contact: {
        title: "Contact",
        sections: [
          {
            blockType: "contact",
            hours: [
              { line: "Lun - Sam 12:00 - 14:00" },
              { line: "Lun - Sam 19:00 - 22:00" }
            ]
          }
        ]
      }
    };
  }

  if (type === "prestataire") {
    return {
      home: {
        title: "Accueil",
        sections: [
          {
            blockType: "hero",
            title: "Nom du service",
            subtitle: "Depannage • Entretien • Intervention rapide",
            align: "left",
            overlay: 40,
            height: "md"
          },
          {
            blockType: "about",
            title: "Notre savoir-faire",
            body: "Intervention locale depuis 2012, devis clair et rapide.",
            imagePosition: "left"
          }
        ]
      },
      services: {
        title: "Services",
        sections: [
          {
            blockType: "services",
            variant: "cards",
            groups: [
              {
                title: "Prestations",
                categories: [
                  {
                    title: "",
                    items: [
                      { name: "Diagnostic", description: "Controle complet et conseils." },
                      { name: "Reparation", description: "Pieces d'origine et main d'oeuvre." },
                      { name: "Entretien", description: "Forfaits simples et transparents." }
                    ]
                  }
                ]
              }
            ]
          },
          {
            blockType: "pricing",
            variant: "cards",
            offers: [
              { title: "Forfait diagnostic", price: "49.00", description: "Controle complet." },
              { title: "Main d'oeuvre", price: "39.00", description: "Par heure." }
            ]
          }
        ]
      },
      gallery: {
        title: "Galerie",
        sections: [
          {
            blockType: "gallery",
            columns: "3",
            images: []
          }
        ]
      },
      team: {
        title: "Equipe",
        sections: []
      },
      contact: {
        title: "Contact",
        sections: [
          {
            blockType: "contact",
            hours: [{ line: "Lun - Ven 08:30 - 18:00" }]
          }
        ]
      }
    };
  }

  return {
    home: {
      title: "Accueil",
      sections: [
        {
          blockType: "hero",
          title: "Association Nom",
          subtitle: "Agir localement pour une cause utile",
          align: "left",
          overlay: 40,
          height: "md"
        },
        {
          blockType: "about",
          title: "Qui sommes-nous ?",
          body: "Association locale engagee autour de projets solidaires.",
          imagePosition: "left"
        }
      ]
    },
    services: {
      title: "Actions",
      sections: [
        {
          blockType: "services",
          variant: "list",
          groups: [
            {
              title: "Actions principales",
              categories: [
                {
                  title: "",
                  items: [
                    { name: "Ateliers", description: "Rencontres et actions locales." },
                    { name: "Accompagnement", description: "Aide et orientation." },
                    { name: "Evenements", description: "Temps forts et rassemblements." }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    gallery: {
      title: "Galerie",
      sections: [
        {
          blockType: "gallery",
          columns: "3",
          images: []
        }
      ]
    },
    team: {
      title: "Equipe",
      sections: []
    },
    contact: {
      title: "Contact",
      sections: [
        {
          blockType: "contact",
          hours: [{ line: "Mer 14:00 - 18:00" }]
        }
      ]
    }
  };
};

const buildEmptyPages = (type: FormState["type"]) => {
  const servicesLabel =
    type === "restaurant" ? "Menu" : type === "association" ? "Actions" : "Services";
  return {
    home: { title: "Accueil", sections: [] },
    services: { title: servicesLabel, sections: [] },
    gallery: { title: "Galerie", sections: [] },
    team: { title: "Equipe", sections: [] },
    contact: { title: "Contact", sections: [] }
  };
};

const emptyFormState: FormState = {
  name: "",
  slug: "",
  type: "association",
  ownerId: "",
  theme: "moderne",
  palette: "ocean",
  typo: "fraunces-source",
  useTemplate: true
};

const ownerLabel = (owner?: ProPageItem["owner"]) => {
  if (!owner) return "—";
  if (typeof owner === "string" || typeof owner === "number") return String(owner);
  return owner.name || owner.email || "Utilisateur";
};

const ownerIdValue = (owner?: ProPageItem["owner"]) => {
  if (!owner) return "";
  if (typeof owner === "string" || typeof owner === "number") return String(owner);
  return String(owner.id ?? "");
};

const parseApiError = async (response: Response, fallback: string) => {
  const data = await response.json().catch(() => ({}));
  return data?.errors?.[0]?.message || data?.message || fallback;
};

const parseOwnerValue = (value: string) => {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  return value;
};

export const ParametresProPagesPanel = () => {
  const [pages, setPages] = useState<ProPageItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [slugTouched, setSlugTouched] = useState(false);

  const owners = useMemo(() => users, [users]);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const [pagesResult, usersResult] = await Promise.all([
          fetchProPages(),
          fetchUsers()
        ]);
        if (!isActive) return;
        setPages(pagesResult);
        setUsers(usersResult);
        if (!formState.ownerId && usersResult.length > 0) {
          setFormState((prev) => ({ ...prev, ownerId: String(usersResult[0].id) }));
        }
      } catch (error) {
        if (isActive) {
          setMessage(error instanceof Error ? error.message : "Chargement impossible.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [formState.ownerId]);

  const handleNameChange = (value: string) => {
    setFormState((prev) => {
      if (slugTouched) {
        return { ...prev, name: value };
      }
      return { ...prev, name: value, slug: slugify(value) };
    });
  };

  const handleCreate = async () => {
    if (!formState.name.trim() || !formState.slug.trim() || !formState.ownerId) {
      setMessage("Nom, slug et proprietaire sont requis.");
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const payload = {
        name: formState.name.trim(),
        slug: formState.slug.trim(),
        type: formState.type,
        status: "draft",
        owner: parseOwnerValue(formState.ownerId),
        theme: formState.theme,
        palette: formState.palette,
        typo: formState.typo,
        pages: formState.useTemplate
          ? buildTemplatePages(formState.type)
          : buildEmptyPages(formState.type)
      };

      const response = await fetch("/api/pro-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Creation impossible."));
      }
      const data = await response.json();
      const created = (data?.doc ?? data) as ProPageItem;
      setPages((prev) => [created, ...prev]);
      setFormState((prev) => ({
        ...emptyFormState,
        ownerId: prev.ownerId
      }));
      setSlugTouched(false);
      setMessage("Page creee.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Creation impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (page: ProPageItem) => {
    if (!page.id) return;
    const nextStatus = page.status === "published" ? "draft" : "published";
    setBusyId(page.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/pro-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Mise a jour impossible."));
      }
      const data = await response.json();
      const updated = (data?.doc ?? data) as ProPageItem;
      setPages((prev) =>
        prev.map((item) => (String(item.id) === String(updated.id) ? updated : item))
      );
      setMessage("Statut mis a jour.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise a jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (page: ProPageItem) => {
    if (!page.id) return;
    if (!window.confirm("Supprimer cette page ?")) return;
    setBusyId(page.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/pro-pages/${page.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Suppression impossible."));
      }
      setPages((prev) => prev.filter((item) => String(item.id) !== String(page.id)));
      setMessage("Page supprimee.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const handleOwnerChange = async (page: ProPageItem, nextOwnerId: string) => {
    if (!page.id || !nextOwnerId) return;
    setBusyId(page.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/pro-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ owner: parseOwnerValue(nextOwnerId) })
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Mise a jour impossible."));
      }
      const data = await response.json();
      const updated = (data?.doc ?? data) as ProPageItem;
      setPages((prev) =>
        prev.map((item) => (String(item.id) === String(updated.id) ? updated : item))
      );
      setMessage("Proprietaire mis a jour.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise a jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,340px)] lg:items-start">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display text-ink">Pages pro</h2>
              <p className="text-sm text-slate">Creation, publication et acces.</p>
            </div>
            {isLoading ? <span className="text-xs text-slate">Chargement...</span> : null}
          </div>

          {pages.length === 0 ? (
            <p className="text-sm text-slate">Aucune page pro.</p>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={String(page.id)}
                  className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{page.name || page.slug}</p>
                      <p className="text-xs text-slate">
                        /pro/{page.slug} • {formatType(page.type)} • {ownerLabel(page.owner)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        page.status === "published"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {page.status === "published" ? "Publie" : "Brouillon"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                      Proprietaire
                    </span>
                    <select
                      value={ownerIdValue(page.owner)}
                      onChange={(event) => handleOwnerChange(page, event.target.value)}
                      disabled={busyId === page.id}
                      className="glass-input py-1 text-xs disabled:opacity-50"
                    >
                      {owners.length === 0 ? (
                        <option value="">Aucun utilisateur</option>
                      ) : (
                        owners.map((owner) => (
                          <option key={String(owner.id)} value={String(owner.id)}>
                            {owner.name || owner.email || owner.id}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
                    <a
                      className="rounded-full border border-ink/10 px-3 py-2 text-ink/70 transition hover:border-ink/30 hover:text-ink"
                      href={`/pro/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir
                    </a>
                    <a
                      className="rounded-full border border-ink/10 px-3 py-2 text-ink/70 transition hover:border-ink/30 hover:text-ink"
                      href={`/admin/collections/pro-pages/${page.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Editer
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleStatus(page)}
                      disabled={busyId === page.id}
                      className="rounded-full border border-ink/10 px-3 py-2 text-ink/70 transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {page.status === "published" ? "Depublier" : "Publier"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(page)}
                      disabled={busyId === page.id}
                      className="rounded-full border border-rose-200 px-3 py-2 text-rose-600 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-display text-ink">Creer une page</h2>
            <p className="text-sm text-slate">Modele par type + proprietaire.</p>
          </div>

          <div className="space-y-3 text-sm">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Nom
              </span>
              <input
                value={formState.name}
                onChange={(event) => handleNameChange(event.target.value)}
                className="w-full glass-input"
                placeholder="Tonton Pizza"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Slug
              </span>
              <input
                value={formState.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setFormState((prev) => ({ ...prev, slug: event.target.value }));
                }}
                className="w-full glass-input"
                placeholder="tonton-pizza"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Type
              </span>
              <select
                value={formState.type}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    type: event.target.value as FormState["type"]
                  }))
                }
                className="w-full glass-input"
              >
                <option value="association">Association</option>
                <option value="restaurant">Restaurant</option>
                <option value="prestataire">Prestataire</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Proprietaire
              </span>
              <select
                value={formState.ownerId}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, ownerId: event.target.value }))
                }
                className="w-full glass-input"
              >
                {owners.length === 0 ? (
                  <option value="">Aucun utilisateur</option>
                ) : (
                  owners.map((owner) => (
                    <option key={String(owner.id)} value={String(owner.id)}>
                      {owner.name || owner.email || owner.id}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Theme
              </span>
              <select
                value={formState.theme}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    theme: event.target.value as FormState["theme"]
                  }))
                }
                className="w-full glass-input"
              >
                <option value="moderne">Moderne</option>
                <option value="chaleureux">Chaleureux</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Palette
              </span>
              <select
                value={formState.palette}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    palette: event.target.value as FormState["palette"]
                  }))
                }
                className="w-full glass-input"
              >
                <option value="ocean">Ocean</option>
                <option value="terracotta">Terracotta</option>
                <option value="olive">Olive</option>
                <option value="sable">Sable</option>
                <option value="charcoal">Charcoal</option>
                <option value="bleu-nuit">Bleu nuit</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Typo
              </span>
              <select
                value={formState.typo}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    typo: event.target.value as FormState["typo"]
                  }))
                }
                className="w-full glass-input"
              >
                <option value="fraunces-source">Fraunces + Source Sans</option>
                <option value="cormorant-work">Cormorant + Work Sans</option>
                <option value="bebas-dm">Bebas + DM Sans</option>
              </select>
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink/70">
              Utiliser le modele par defaut
              <input
                type="checkbox"
                checked={formState.useTemplate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, useTemplate: event.target.checked }))
                }
                className="h-4 w-4 rounded border-ink/20"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
            className="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Creation..." : "Creer"}
          </button>

          {message ? <p className="text-xs text-slate">{message}</p> : null}
        </Card>
      </div>
    </div>
  );
};
