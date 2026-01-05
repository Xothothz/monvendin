"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { WeatherWidget } from "@/components/WeatherWidget";
import type { WeatherSnapshot } from "@/lib/weather";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type BannerItem = {
  id?: string | number;
  label?: string;
  message: string;
  status?: "draft" | "published";
  order?: number | null;
};

type HomeBannerProps = {
  items: BannerItem[];
  fallbackItems?: BannerItem[];
  allowEdit?: boolean;
  weather?: WeatherSnapshot | null;
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
  const response = await fetch("/api/home-banners?depth=0&limit=50&sort=order", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as BannerItem[];
};

export const HomeBanner = ({ items, fallbackItems, allowEdit, weather }: HomeBannerProps) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [bannerItems, setBannerItems] = useState<BannerItem[]>(items);
  const [isRemoteEmpty, setIsRemoteEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<BannerFormState>(emptyFormState);

  const safeItems = useMemo(
    () =>
      bannerItems.filter(
        (item) =>
          item.message.trim().length > 0 &&
          (item.status ?? "published") === "published"
      ),
    [bannerItems]
  );

  useEffect(() => {
    if (safeItems.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeItems.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [safeItems.length, isPaused]);

  useEffect(() => {
    if (!allowEdit) return;
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
  }, [allowEdit]);

  useEffect(() => {
    if (!allowEdit || !user) return;
    let isActive = true;
    const refresh = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchBannerItems();
        if (!isActive) return;
        if (docs.length > 0) {
          setBannerItems(docs);
          setIsRemoteEmpty(false);
        } else {
          setIsRemoteEmpty(true);
          setBannerItems((prev) => (prev.length > 0 ? prev : items));
        }
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
  }, [allowEdit, user, items]);

  useEffect(() => {
    if (safeItems.length === 0) return;
    if (index > safeItems.length - 1) {
      setIndex(0);
    }
  }, [safeItems.length, index]);

  const canEdit = hasPermission(user, "manageHomeBanners");
  const hasItems = safeItems.length > 0;

  if (!hasItems && !canEdit) {
    return null;
  }

  const current = hasItems ? safeItems[index % safeItems.length] : null;
  const goPrev = () => {
    if (!hasItems) return;
    setIndex((prev) => (prev - 1 + safeItems.length) % safeItems.length);
  };
  const goNext = () => {
    if (!hasItems) return;
    setIndex((prev) => (prev + 1) % safeItems.length);
  };

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
      setIsRemoteEmpty(false);
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
      setIsRemoteEmpty(docs.length === 0);
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  const seedFallbackItems = async () => {
    if (!fallbackItems || fallbackItems.length === 0) return;
    setIsSaving(true);
    setFormError(null);

    try {
      for (const [idx, item] of fallbackItems.entries()) {
        await fetch("/api/home-banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            label: item.label ?? null,
            message: item.message,
            status: "published",
            order: item.order ?? idx + 1
          })
        });
      }

      const docs = await fetchBannerItems();
      setBannerItems(docs);
      setIsRemoteEmpty(false);
    } catch {
      setFormError("Import impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {canEdit ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
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
              Ajouter une info
            </button>
          </div>
        </div>
      ) : null}

      {canEdit && isRemoteEmpty ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
          Contenu par defaut affiche. Importez pour modifier ou supprimer.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <section
          className="flex-1 rounded-xl border border-ink/10 bg-accent px-6 py-4 text-white shadow-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {current ? (
              <div key={index} className="space-y-2 motion-safe:animate-fade-up">
                {current.label ? (
                  <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink">
                    {current.label}
                  </span>
                ) : null}
                <p className="text-sm sm:text-base font-semibold">{current.message}</p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-white/80">
                Aucune info publiee pour le moment.
              </p>
            )}
            {hasItems ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex items-center gap-2 rounded-full border border-white/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  aria-label="Information precedente"
                >
                  <CaretLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Avant</span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 rounded-full border border-white/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  aria-label="Information suivante"
                >
                  <span className="hidden sm:inline">Apres</span>
                  <CaretRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </section>
        {weather ? (
          <div className="self-start lg:self-stretch">
            <WeatherWidget data={weather} />
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex justify-end">
        <Link
          href="/infos"
          className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:bg-white"
        >
          Historique des infos
        </Link>
      </div>

      {canEdit ? (
        <div className="mt-4 space-y-3">
          {isLoading ? <p className="text-xs text-slate">Chargement...</p> : null}
          {bannerItems.map((item) => (
            <div
              key={String(item.id ?? item.message)}
              className="flex flex-wrap items-center justify-between gap-3 glass-panel px-4 py-3 text-xs"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate">
                  {item.label ?? "Info"}
                </p>
                <p className="text-sm font-semibold text-ink">{item.message}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
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
                {(item.status ?? "published") === "draft" ? (
                  <span className="rounded-full border border-ink/10 px-3 py-2 text-[9px] text-slate">
                    Masquee
                  </span>
                ) : (
                  <span className="rounded-full border border-ink/10 px-3 py-2 text-[9px] text-emerald-700">
                    Visible
                  </span>
                )}
              </div>
            </div>
          ))}
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
