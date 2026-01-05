"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type BannerItem = {
  id?: string | number;
  label?: string;
  message: string;
  status?: "draft" | "published";
  order?: number | null;
  createdAt?: string | null;
};

type HomeBannerHistoryProps = {
  items: BannerItem[];
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type BannerFormState = {
  label: string;
  message: string;
  status: "draft" | "published";
  order: string;
};

const emptyFormState: BannerFormState = {
  label: "",
  message: "",
  status: "published",
  order: "1"
};

const fetchBannerItems = async () => {
  const response = await fetch("/api/home-banners?depth=0&limit=200&sort=-createdAt", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as BannerItem[];
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);
};

export const HomeBannerHistory = ({ items }: HomeBannerHistoryProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [bannerItems, setBannerItems] = useState<BannerItem[]>(items);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<BannerFormState>(emptyFormState);

  const displayItems = useMemo(() => {
    const trimmed = bannerItems.filter((item) => item.message.trim().length > 0);
    if (user) return trimmed;
    return trimmed.filter((item) => (item.status ?? "published") === "published");
  }, [bannerItems, user]);

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
    if (!user) return;
    let isActive = true;
    const refresh = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchBannerItems();
        if (!isActive) return;
        setBannerItems(docs);
      } catch {
        if (isActive) setBannerItems((prev) => prev);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    refresh();

    return () => {
      isActive = false;
    };
  }, [user]);

  const canEdit = hasPermission(user, "manageHomeBanners");

  const openCreate = () => {
    const nextOrder =
      bannerItems.length > 0 ? Math.max(...bannerItems.map((item) => item.order ?? 0)) + 1 : 1;
    setFormState({ ...emptyFormState, order: String(nextOrder) });
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: BannerItem) => {
    setFormState({
      label: item.label ?? "",
      message: item.message ?? "",
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

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        label: formState.label.trim() || null,
        message: formState.message.trim(),
        status: formState.status,
        order: Number(formState.order) || 0
      };

      const response = await fetch(
        editingId ? `/api/home-banners/${editingId}` : "/api/home-banners",
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

      const docs = await fetchBannerItems();
      setBannerItems(docs);
      closeModal();
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string | number) => {
    if (!window.confirm("Supprimer cette info ?")) {
      return;
    }
    setDeletingId(itemId);
    try {
      await fetch(`/api/home-banners/${itemId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const docs = await fetchBannerItems();
      setBannerItems(docs);
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (item: BannerItem) => {
    if (!item.id) return;
    const nextStatus = (item.status ?? "published") === "published" ? "draft" : "published";
    try {
      await fetch(`/api/home-banners/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus })
      });
      const docs = await fetchBannerItems();
      setBannerItems(docs);
    } catch {
      setFormError("Mise a jour impossible.");
    }
  };

  return (
    <>
      {canEdit ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <span>Mode admin actif</span>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
          >
            Ajouter une info
          </button>
        </div>
      ) : null}

      {isLoading ? <p className="mb-4 text-xs text-slate">Chargement...</p> : null}

      {displayItems.length > 0 ? (
        <div className="space-y-3">
          {displayItems.map((item) => {
            const isPublished = (item.status ?? "published") === "published";
            const created = formatDate(item.createdAt);
            return (
              <div
                key={String(item.id ?? item.message)}
                className="flex flex-wrap items-center justify-between gap-3 glass-panel px-4 py-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate">
                    <span>{item.label ?? "Info"}</span>
                    {created ? <span className="text-ink/50">{created}</span> : null}
                  </div>
                  <p className="text-sm font-semibold text-ink">{item.message}</p>
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
                  {canEdit ? (
                    <label className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={() => handleToggleVisibility(item)}
                        className="h-3.5 w-3.5 accent-ink"
                      />
                      Afficher
                    </label>
                  ) : null}
                  {canEdit ? (
                    <>
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
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate">Aucune info pour le moment.</p>
      )}

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
                  Bandeau
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Modifier l'info" : "Nouvelle info"}
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
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-ink/80">
                  Label
                  <input
                    type="text"
                    value={formState.label}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, label: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
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
              </div>
              <label className="block text-sm font-semibold text-ink/80">
                Message
                <textarea
                  value={formState.message}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, message: event.target.value }))
                  }
                  rows={4}
                  className="mt-2 w-full glass-input"
                  required
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
                Afficher dans le bandeau
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
    </>
  );
};
