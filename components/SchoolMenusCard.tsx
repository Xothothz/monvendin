"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type SchoolMenuItem = {
  id?: string | number;
  title: string;
  linkLabel?: string | null;
  linkUrl?: string | null;
  status?: "draft" | "published";
  order?: number | null;
};

type SchoolMenusCardProps = {
  items: SchoolMenuItem[];
  fallbackItems?: SchoolMenuItem[];
  yearLabel?: string;
  moreLink?: string;
  settingsId?: string | null;
  settingsSlug?: string;
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type MenuFormState = {
  title: string;
  linkLabel: string;
  linkUrl: string;
  status: "draft" | "published";
  order: string;
};

const emptyFormState: MenuFormState = {
  title: "",
  linkLabel: "",
  linkUrl: "",
  status: "published",
  order: "1"
};

const fetchMenuItems = async () => {
  const response = await fetch("/api/school-menus?depth=0&limit=200&sort=order", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as SchoolMenuItem[];
};

export const SchoolMenusCard = ({
  items,
  fallbackItems,
  yearLabel = "2025 - 2026",
  moreLink = "https://www.sivom-bethunois.fr/index.php/restauration/menus/",
  settingsId,
  settingsSlug
}: SchoolMenusCardProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuItems, setMenuItems] = useState<SchoolMenuItem[]>(items);
  const [isRemoteEmpty, setIsRemoteEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [formState, setFormState] = useState<MenuFormState>(emptyFormState);
  const [settingsDocId, setSettingsDocId] = useState<string | number | null>(
    settingsId ?? null
  );
  const [yearLabelValue, setYearLabelValue] = useState(yearLabel);
  const [yearLabelDraft, setYearLabelDraft] = useState(yearLabel ?? "");

  const canEdit = hasPermission(user, "manageSchoolMenus");

  const sortedItems = useMemo(
    () =>
      [...menuItems].sort((a, b) => {
        const aOrder = a.order ?? 0;
        const bOrder = b.order ?? 0;
        return aOrder - bOrder;
      }),
    [menuItems]
  );

  const publishedItems = useMemo(
    () => sortedItems.filter((item) => (item.status ?? "published") === "published"),
    [sortedItems]
  );

  const displayItems = canEdit ? sortedItems : publishedItems;

  useEffect(() => {
    let isActive = true;
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include"
        });
        if (!response.ok) {
          if (isActive) setUser(null);
          return;
        }
        const data = await response.json();
        if (isActive) setUser(data?.user ?? null);
      } catch {
        if (isActive) setUser(null);
      }
    };

    checkAuth();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!canEdit) return;
    let isActive = true;
    const refresh = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchMenuItems();
        if (!isActive) return;
        if (docs.length > 0) {
          setMenuItems(docs);
          setIsRemoteEmpty(false);
        } else {
          setIsRemoteEmpty(true);
          if (fallbackItems?.length) {
            setMenuItems(fallbackItems);
          }
        }
      } catch {
        if (isActive) setMenuItems((prev) => prev);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    refresh();

    return () => {
      isActive = false;
    };
  }, [canEdit, fallbackItems]);

  useEffect(() => {
    if (!canEdit) return;
    if (!settingsSlug) return;
    let isActive = true;
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `/api/school-menu-settings?depth=0&limit=1&where[slug][equals]=${encodeURIComponent(
            settingsSlug
          )}`,
          { credentials: "include" }
        );
        if (!response.ok) return;
        const data = await response.json();
        const doc = data?.docs?.[0];
        if (!isActive || !doc) return;
        setSettingsDocId(doc.id ?? null);
        if (doc.yearLabel) {
          setYearLabelValue(doc.yearLabel);
          setYearLabelDraft(doc.yearLabel);
        }
      } catch {
        // ignore
      }
    };

    fetchSettings();

    return () => {
      isActive = false;
    };
  }, [canEdit, settingsSlug]);

  const openCreate = () => {
    const nextOrder =
      menuItems.length > 0 ? Math.max(...menuItems.map((item) => item.order ?? 0)) + 1 : 1;
    setFormState({ ...emptyFormState, order: String(nextOrder) });
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: SchoolMenuItem) => {
    setFormState({
      title: item.title ?? "",
      linkLabel: item.linkLabel ?? "",
      linkUrl: item.linkUrl ?? "",
      status: item.status ?? "published",
      order: String(item.order ?? 0)
    });
    setEditingId(item.id ?? null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setEditingId(null);
    setFormState(emptyFormState);
  };

  const openSettings = () => {
    setYearLabelDraft(yearLabelValue ?? "");
    setSettingsError(null);
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setSettingsError(null);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        title: formState.title.trim(),
        linkLabel: formState.linkLabel.trim() || null,
        linkUrl: formState.linkUrl.trim(),
        status: formState.status,
        order: Number(formState.order) || 0
      };

      if (!payload.title || !payload.linkUrl) {
        setFormError("Titre et lien sont obligatoires.");
        setIsSaving(false);
        return;
      }

      const response = await fetch(
        editingId ? `/api/school-menus/${editingId}` : "/api/school-menus",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.errors?.[0]?.message || data?.message || "Enregistrement impossible.";
        setFormError(message);
        setIsSaving(false);
        return;
      }

      const docs = await fetchMenuItems();
      setMenuItems(docs);
      setIsRemoteEmpty(false);
      closeModal();
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settingsSlug) return;
    const nextLabel = yearLabelDraft.trim();
    if (!nextLabel) {
      setSettingsError("L'annee scolaire est obligatoire.");
      return;
    }
    setIsSaving(true);
    setSettingsError(null);

    try {
      const payload = {
        slug: settingsSlug,
        yearLabel: nextLabel
      };
      const response = await fetch(
        settingsDocId ? `/api/school-menu-settings/${settingsDocId}` : "/api/school-menu-settings",
        {
          method: settingsDocId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.errors?.[0]?.message || data?.message || "Enregistrement impossible.";
        setSettingsError(message);
        setIsSaving(false);
        return;
      }
      const data = await response.json().catch(() => ({}));
      const nextId = data?.doc?.id ?? data?.id ?? settingsDocId;
      setSettingsDocId(nextId ?? settingsDocId);
      setYearLabelValue(nextLabel);
      setIsSettingsOpen(false);
    } catch {
      setSettingsError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string | number) => {
    if (!window.confirm("Supprimer ce menu ?")) {
      return;
    }
    setDeletingId(itemId);
    try {
      await fetch(`/api/school-menus/${itemId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const docs = await fetchMenuItems();
      setMenuItems(docs);
      setIsRemoteEmpty(docs.length === 0);
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (item: SchoolMenuItem) => {
    if (!item.id) return;
    const nextStatus = (item.status ?? "published") === "published" ? "draft" : "published";
    try {
      await fetch(`/api/school-menus/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus })
      });
      const docs = await fetchMenuItems();
      setMenuItems(docs);
      setIsRemoteEmpty(docs.length === 0);
    } catch {
      setFormError("Mise a jour impossible.");
    }
  };

  const seedFallbackItems = async () => {
    if (!fallbackItems || fallbackItems.length === 0) return;
    setIsSaving(true);
    setFormError(null);

    try {
      for (const [idx, item] of fallbackItems.entries()) {
        await fetch("/api/school-menus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: item.title,
            linkLabel: item.linkLabel ?? null,
            linkUrl: item.linkUrl ?? null,
            status: "published",
            order: item.order ?? idx + 1
          })
        });
      }

      const docs = await fetchMenuItems();
      setMenuItems(docs);
      setIsRemoteEmpty(false);
    } catch {
      setFormError("Import impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <span>Mode admin actif</span>
          <div className="flex flex-wrap items-center gap-2">
            {isRemoteEmpty && fallbackItems?.length ? (
              <button
                type="button"
                onClick={seedFallbackItems}
                disabled={isSaving}
                className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Import..." : "Importer le contenu actuel"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
            >
              Ajouter un menu
            </button>
          </div>
        </div>
      ) : null}

      {canEdit && isRemoteEmpty ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
          Contenu par defaut affiche. Importez pour modifier ou supprimer.
        </p>
      ) : null}

      <Card className="p-6 space-y-4 bg-fog">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-display text-ink">Menus disponibles</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">
              {yearLabelValue}
            </span>
            {canEdit ? (
              <button
                type="button"
                onClick={openSettings}
                className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70 hover:bg-goldSoft"
              >
                Modifier
              </button>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          {publishedItems.length > 0 ? (
            publishedItems.map((item) => {
              const linkLabel = item.linkLabel?.trim() || "Telecharger le menu";
              return (
                <div
                  key={String(item.id ?? item.title)}
                  className="rounded-2xl border border-ink/10 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  {item.linkUrl ? (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-gold/60 hover:text-accent"
                    >
                      {linkLabel}
                    </a>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate">Aucun menu disponible pour le moment.</p>
          )}
        </div>
        <a
          href={moreLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
        >
          Consulter tous les menus scolaires
        </a>
      </Card>

      {canEdit ? (
        <div className="space-y-3">
          {isLoading ? <p className="text-xs text-slate">Chargement...</p> : null}
          {displayItems.map((item) => {
            const isPublished = (item.status ?? "published") === "published";
            return (
              <div
                key={String(item.id ?? item.title)}
                className="flex flex-wrap items-center justify-between gap-3 glass-panel px-4 py-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate">
                    Menu
                  </p>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  {item.linkUrl ? (
                    <p className="text-xs text-ink/60">{item.linkUrl}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                  <span
                    className={
                      isPublished
                        ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700"
                        : "rounded-full border border-ink/10 px-3 py-2 text-slate"
                    }
                  >
                    {isPublished ? "Visible" : "Masquee"}
                  </span>
                  <label className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={() => handleToggleVisibility(item)}
                      className="h-3.5 w-3.5 accent-ink"
                    />
                    Afficher
                  </label>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-full border border-ink/10 px-3 py-2"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => item.id && handleDelete(item.id)}
                    disabled={!item.id || deletingId === item.id}
                    className="rounded-full border border-ink/10 px-3 py-2 text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={closeModal}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Menus scolaires
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Modifier le menu" : "Nouveau menu"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSave}>
              <label className="block text-sm font-semibold text-ink/80">
                Titre
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="mt-2 w-full glass-input"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-ink/80">
                Texte du bouton
                <input
                  type="text"
                  value={formState.linkLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, linkLabel: event.target.value }))
                  }
                  className="mt-2 w-full glass-input"
                />
              </label>
              <label className="block text-sm font-semibold text-ink/80">
                Lien du menu (PDF)
                <input
                  type="url"
                  value={formState.linkUrl}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, linkUrl: event.target.value }))
                  }
                  className="mt-2 w-full glass-input"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-ink/80">
                Ordre
                <input
                  type="number"
                  value={formState.order}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, order: event.target.value }))
                  }
                  className="mt-2 w-full glass-input"
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-ink/80">
                <input
                  type="checkbox"
                  checked={formState.status === "published"}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: event.target.checked ? "published" : "draft"
                    }))
                  }
                  className="h-4 w-4 accent-ink"
                />
                Afficher dans la liste
              </label>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isSettingsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={closeSettings}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Menus scolaires
                </p>
                <h2 className="mt-2 text-2xl font-display">Modifier l'annee scolaire</h2>
              </div>
              <button
                type="button"
                onClick={closeSettings}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSaveSettings}>
              <label className="block text-sm font-semibold text-ink/80">
                Annee scolaire
                <input
                  type="text"
                  value={yearLabelDraft}
                  onChange={(event) => setYearLabelDraft(event.target.value)}
                  className="mt-2 w-full glass-input"
                  required
                />
              </label>

              {settingsError ? <p className="text-sm text-red-600">{settingsError}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeSettings}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
