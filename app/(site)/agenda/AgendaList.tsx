"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  CaretLeft,
  CaretRight,
  EnvelopeSimple,
  MapPinLine,
  ShareNetwork
} from "@phosphor-icons/react";
import { SearchInput } from "@/components/SearchInput";
import { RichTextEditor } from "@/components/RichTextEditor";

type AgendaEvent = {
  id: string | number;
  title: string;
  slug?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  address?: string | null;
  summary?: string | null;
  description?: string | null;
  externalLink?: string | null;
  status?: "draft" | "review" | "published";
  image?: { id?: string; url?: string; alt?: string } | string | null;
  imageUrl?: string | null;
};

type AgendaListProps = {
  events: AgendaEvent[];
  siteUrl: string;
};

type AdminUser = {
  email?: string;
  name?: string;
  role?: "admin" | "editor";
};

type AgendaFormState = {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  summary: string;
  description: string;
  externalLink: string;
  status: "draft" | "review" | "published";
  imageFile: File | null;
  existingImageUrl: string | null;
  existingImageId: string | null;
};

const emptyFormState: AgendaFormState = {
  title: "",
  startDate: "",
  endDate: "",
  location: "",
  address: "",
  summary: "",
  description: "",
  externalLink: "",
  status: "draft",
  imageFile: null,
  existingImageUrl: null,
  existingImageId: null
};

const formatMonthLabel = (value: Date) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value));

const formatFullDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const toLocalInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toISODate = (value: string) => (value ? new Date(value).toISOString() : null);

const startOfWeek = (value: Date) => {
  const day = (value.getDay() + 6) % 7;
  const start = new Date(value);
  start.setDate(value.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};

const endOfWeek = (start: Date) => {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const monthRange = (value: Date) => {
  const start = new Date(value.getFullYear(), value.getMonth(), 1);
  const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatRangeLabel = (viewMode: "month" | "week" | "all", cursor: Date) => {
  if (viewMode === "all") return "Tous les evenements";
  if (viewMode === "month") return formatMonthLabel(cursor);
  const start = startOfWeek(cursor);
  const end = endOfWeek(start);
  const formatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
  return `Semaine du ${formatter.format(start)} au ${formatter.format(end)}`;
};

const fetchEvents = async () => {
  const response = await fetch("/api/events?depth=1&limit=200&sort=startDate", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as AgendaEvent[];
};

const uploadImage = async (file: File, alt: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (alt) {
    formData.append("alt", alt);
  }

  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Upload photo impossible.");
  }

  const data = await response.json();
  return data?.doc?.id ?? data?.id ?? null;
};

const getImageMeta = (event: AgendaEvent) => {
  if (!event.image) {
    return { id: null, url: event.imageUrl ?? null };
  }
  if (typeof event.image === "string") {
    return { id: event.image, url: event.imageUrl ?? null };
  }
  return { id: event.image.id ?? null, url: event.image.url ?? event.imageUrl ?? null };
};

export const AgendaList = ({ events: initialEvents, siteUrl }: AgendaListProps) => {
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"month" | "week" | "all">("all");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<AgendaFormState>(emptyFormState);
  const [removeImage, setRemoveImage] = useState(false);

  const canEdit = Boolean(user);
  const canDelete = user?.role === "admin";

  const statusOptions = useMemo(() => {
    if (user?.role === "admin") {
      return ["draft", "review", "published"] as const;
    }
    return ["draft", "review"] as const;
  }, [user?.role]);

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
        const docs = await fetchEvents();
        if (isActive) {
          setEvents(docs);
        }
      } catch {
        if (isActive) setEvents((prev) => prev);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    refresh();

    return () => {
      isActive = false;
    };
  }, [canEdit]);

  useEffect(() => {
    if (viewMode === "all") return;
    if (viewMode === "month") {
      setCursorDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), 1));
    } else {
      setCursorDate((prev) => startOfWeek(prev));
    }
  }, [viewMode]);

  const locations = useMemo(() => {
    const values = events
      .map((event) => event.location)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values));
  }, [events]);

  const range = useMemo(() => {
    if (viewMode === "all") return null;
    if (viewMode === "month") {
      return monthRange(cursorDate);
    }
    const start = startOfWeek(cursorDate);
    return { start, end: endOfWeek(start) };
  }, [viewMode, cursorDate]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const startDate = new Date(event.startDate);
      const inRange = !range || (startDate >= range.start && startDate <= range.end);
      const matchesLocation = locationFilter === "all" || event.location === locationFilter;
      const matchesQuery =
        !query ||
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        (event.summary ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (event.location ?? "").toLowerCase().includes(query.toLowerCase());
      return inRange && matchesLocation && matchesQuery;
    });
  }, [events, range, locationFilter, query]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    next.sort((a, b) => {
      const aTime = new Date(a.startDate).getTime();
      const bTime = new Date(b.startDate).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
    return next;
  }, [filtered, sortOrder]);

  const moveRange = (direction: -1 | 1) => {
    if (viewMode === "all") return;
    setCursorDate((prev) => {
      if (viewMode === "month") {
        return new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      }
      const next = new Date(prev);
      next.setDate(prev.getDate() + direction * 7);
      return next;
    });
  };

  const openCreate = () => {
    setFormState(emptyFormState);
    setEditingId(null);
    setRemoveImage(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (event: AgendaEvent) => {
    const imageMeta = getImageMeta(event);
    setFormState({
      title: event.title ?? "",
      startDate: toLocalInputValue(event.startDate),
      endDate: toLocalInputValue(event.endDate),
      location: event.location ?? "",
      address: event.address ?? "",
      summary: event.summary ?? "",
      description: event.description ?? "",
      externalLink: event.externalLink ?? "",
      status: event.status ?? "draft",
      imageFile: null,
      existingImageUrl: imageMeta.url ?? null,
      existingImageId: imageMeta.id ?? null
    });
    setEditingId(String(event.id));
    setRemoveImage(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setEditingId(null);
    setFormState(emptyFormState);
    setRemoveImage(false);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      let imageId = formState.existingImageId;
      if (removeImage) {
        imageId = null;
      } else if (formState.imageFile) {
        imageId = await uploadImage(formState.imageFile, formState.title || "Evenement");
      }

      const payload = {
        title: formState.title.trim(),
        startDate: toISODate(formState.startDate),
        endDate: formState.endDate ? toISODate(formState.endDate) : null,
        location: formState.location.trim(),
        address: formState.address.trim() || null,
        summary: formState.summary.trim(),
        description: formState.description.trim() || null,
        externalLink: formState.externalLink.trim() || null,
        status: formState.status,
        ...(removeImage ? { image: null } : imageId ? { image: imageId } : {})
      };

      const response = await fetch(
        editingId ? `/api/events/${editingId}` : "/api/events",
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

      if (canEdit) {
        const docs = await fetchEvents();
        setEvents(docs);
      }
      closeModal();
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Supprimer cet evenement ?")) {
      return;
    }
    setDeletingId(eventId);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (canEdit) {
        const docs = await fetchEvents();
        setEvents(docs);
      }
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {canEdit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <span>Mode admin actif</span>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
          >
            Ajouter un evenement
          </button>
        </div>
      ) : null}

        <div className="flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => moveRange(-1)}
              disabled={viewMode === "all"}
              className={clsx(
                "rounded-full border border-ink/10 bg-white px-3 py-2 text-ink/70 hover:bg-goldSoft/70",
                viewMode === "all" && "cursor-not-allowed opacity-50"
              )}
              aria-label="Periode precedente"
            >
              <CaretLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate">
                {viewMode === "month" ? "Mois" : viewMode === "week" ? "Semaine" : "Toutes dates"}
              </p>
              <p className="text-lg font-display text-ink">{formatRangeLabel(viewMode, cursorDate)}</p>
            </div>
            <button
              type="button"
              onClick={() => moveRange(1)}
              disabled={viewMode === "all"}
              className={clsx(
                "rounded-full border border-ink/10 bg-white px-3 py-2 text-ink/70 hover:bg-goldSoft/70",
                viewMode === "all" && "cursor-not-allowed opacity-50"
              )}
              aria-label="Periode suivante"
            >
              <CaretRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                viewMode === "all" ? "bg-ink text-white" : "text-ink/60"
              )}
            >
              Tout
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                viewMode === "week" ? "bg-ink text-white" : "text-ink/60"
              )}
            >
              Hebdo
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                viewMode === "month" ? "bg-ink text-white" : "text-ink/60"
              )}
            >
              Mensuel
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_200px_220px]">
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un evenement" />
          <label className="flex flex-col text-xs uppercase tracking-widest text-slate">
            Lieu
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="mt-2 rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm text-ink focus-ring"
            >
              <option value="all">Tous les lieux</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs uppercase tracking-widest text-slate">
            Tri
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
              className="mt-2 rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm text-ink focus-ring"
            >
              <option value="asc">Plus proche &gt; plus ancien</option>
              <option value="desc">Plus ancien &gt; plus proche</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-slate">Chargement...</p> : null}

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-white p-6 text-center text-slate shadow-card">
          Aucun evenement trouve pour cette periode.
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((event) => {
            const eventUrl = event.slug ? `${siteUrl}/agenda/${event.slug}` : siteUrl;
            const imageMeta = getImageMeta(event);
            const startLabel = formatFullDate(event.startDate);
            const timeLabel = formatTime(event.startDate);
            const endLabel = event.endDate ? formatFullDate(event.endDate) : null;
            return (
              <article
                key={String(event.id)}
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card"
              >
                <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                  <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent/15 via-white to-gold/25">
                    {imageMeta.url ? (
                      <img
                        src={imageMeta.url}
                        alt={event.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate">
                      <span>{startLabel}</span>
                      <span>{timeLabel}</span>
                      {endLabel ? <span>Fin {endLabel}</span> : null}
                      {event.status === "draft" ? (
                        <span className="rounded-full border border-ink/10 px-3 py-1 text-[10px] text-ink/60">
                          Brouillon
                        </span>
                      ) : null}
                      {event.status === "review" ? (
                        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] text-ink">
                          En attente
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-display text-ink">{event.title}</h3>
                    <div className="space-y-1 text-sm text-slate">
                      <p className="flex items-center gap-2">
                        <MapPinLine className="h-4 w-4" aria-hidden="true" />
                        {event.location || "Lieu a confirmer"}
                      </p>
                      {event.address ? <p>{event.address}</p> : null}
                    </div>
                    {event.summary ? <p className="text-sm text-slate">{event.summary}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60 md:flex-col md:items-end">
                    {event.slug ? (
                      <Link href={`/agenda/${event.slug}`} className="text-sm font-semibold text-ink">
                        Voir le detail
                      </Link>
                    ) : null}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        eventUrl
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate hover:text-ink"
                    >
                      <ShareNetwork className="h-4 w-4" aria-hidden="true" />
                      Partager
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        event.title
                      )}&body=${encodeURIComponent(eventUrl)}`}
                      className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate hover:text-ink"
                    >
                      <EnvelopeSimple className="h-4 w-4" aria-hidden="true" />
                      Email
                    </a>
                    {canEdit ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className="rounded-full border border-ink/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                        >
                          Modifier
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(String(event.id))}
                            disabled={deletingId === String(event.id)}
                            className="rounded-full border border-ink/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === String(event.id) ? "Suppression..." : "Supprimer"}
                          </button>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
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
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Agenda
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Modifier l'evenement" : "Nouvel evenement"}
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
                  Titre
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-ink/80">
                  Lieu
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, location: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-ink/80">
                  Debut
                  <input
                    type="datetime-local"
                    value={formState.startDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-ink/80">
                  Fin
                  <input
                    type="datetime-local"
                    value={formState.endDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, endDate: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-ink/80">
                Adresse
                <input
                  type="text"
                  value={formState.address}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, address: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </label>

              <label className="block text-sm font-semibold text-ink/80">
                Resume
                <textarea
                  value={formState.summary}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, summary: event.target.value }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  required
                />
              </label>

              <div className="block text-sm font-semibold text-ink/80">
                <p>Description</p>
                <div className="mt-2">
                  <RichTextEditor
                    value={formState.description}
                    onChange={(value) =>
                      setFormState((prev) => ({ ...prev, description: value }))
                    }
                  />
                </div>
              </div>

              <label className="block text-sm font-semibold text-ink/80">
                Lien externe
                <input
                  type="text"
                  value={formState.externalLink}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, externalLink: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </label>

              <label className="block text-sm font-semibold text-ink/80">
                Illustration
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setFormState((prev) => ({ ...prev, imageFile: file }));
                    setRemoveImage(false);
                  }}
                  className="mt-2 block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </label>

              {formState.existingImageUrl && !formState.imageFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setRemoveImage(true);
                    setFormState((prev) => ({
                      ...prev,
                      existingImageUrl: null,
                      existingImageId: null
                    }));
                  }}
                  className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
                >
                  Retirer l'image
                </button>
              ) : null}

              <label className="block text-sm font-semibold text-ink/80">
                Statut
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: event.target.value as "draft" | "review" | "published"
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "draft"
                        ? "Brouillon"
                        : status === "review"
                          ? "En attente"
                          : "Publie"}
                    </option>
                  ))}
                </select>
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
    </div>
  );
};
