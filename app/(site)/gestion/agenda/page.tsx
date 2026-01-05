"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { RichTextEditor } from "@/components/RichTextEditor";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type User = UserWithPermissions & {
  id: string;
  email: string;
  name?: string | null;
};

type AgendaEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  location: string;
  address?: string | null;
  summary?: string | null;
  description?: string | null;
  status: "draft" | "review" | "published";
  externalLink?: string | null;
  image?: { id: string; url?: string; alt?: string } | string | null;
  updatedAt?: string;
};

type AgendaForm = {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  summary: string;
  description: string;
  externalLink: string;
  status: "draft" | "review" | "published";
  imageId?: string | null;
};

const emptyForm: AgendaForm = {
  title: "",
  startDate: "",
  endDate: "",
  location: "",
  address: "",
  summary: "",
  description: "",
  externalLink: "",
  status: "draft",
  imageId: null
};

const statusLabels: Record<AgendaEvent["status"], string> = {
  draft: "Brouillon",
  review: "En attente",
  published: "Publie"
};

const statusStyles: Record<AgendaEvent["status"], string> = {
  draft: "bg-white text-ink border border-ink/10",
  review: "bg-goldSoft text-ink border border-gold/40",
  published: "bg-accent text-white border border-accent"
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

const toLocalInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toISODate = (value: string) => (value ? new Date(value).toISOString() : undefined);

const getImageId = (event: AgendaEvent) => {
  if (typeof event.image === "object" && event.image) {
    return event.image.id;
  }
  return event.image ? String(event.image) : null;
};

const getImageUrl = (event: AgendaEvent) => {
  if (typeof event.image === "object" && event.image?.url) {
    return event.image.url;
  }
  return null;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Une erreur est survenue.";
};

export default function AgendaAdminPage() {
  const shellClass = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 xl:px-12 py-10";
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [form, setForm] = useState<AgendaForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | AgendaEvent["status"]>("all");
  const [search, setSearch] = useState("");
  const [isBooting, setIsBooting] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );

  const canEdit = hasPermission(user, "manageAgenda");
  const canPublish = hasPermission(user, "canPublish");

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === String(selectedId)) ?? null,
    [events, selectedId]
  );

  const statusOptions = useMemo(() => {
    if (canPublish) {
      return ["draft", "review", "published"] as const;
    }
    return ["draft", "review"] as const;
  }, [canPublish]);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((event) => {
      if (statusFilter !== "all" && event.status !== statusFilter) return false;
      if (!term) return true;
      return (
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    });
  }, [events, search, statusFilter]);

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setImageFile(null);
    setSelectedId(null);
  }, []);

  const loadEvents = useCallback(async () => {
    const response = await fetch("/api/events?limit=200&sort=-startDate&depth=1", {
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Impossible de charger les evenements.");
    }

    const data = await response.json();
    setEvents(data.docs ?? []);
  }, []);

  const loadSession = useCallback(async () => {
    setIsBooting(true);
    try {
      const response = await fetch("/api/users/me", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await loadEvents();
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsBooting(false);
    }
  }, [loadEvents]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || !password) {
      setMessage({ tone: "error", text: "Email et mot de passe obligatoires." });
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Identifiants invalides.");
      }

      const data = await response.json();
      setUser(data.user);
      await loadEvents();
      setMessage({ tone: "success", text: "Connexion reussie." });
    } catch (error) {
      setMessage({ tone: "error", text: getErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    setIsBusy(true);
    setMessage(null);
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      setEvents([]);
      resetForm();
    } catch (error) {
      setMessage({ tone: "error", text: getErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSelectEvent = (event: AgendaEvent) => {
    const nextStatus =
      !canPublish && event.status === "published" ? "review" : event.status ?? "draft";
    setSelectedId(String(event.id));
    setForm({
      title: event.title ?? "",
      startDate: toLocalInputValue(event.startDate),
      endDate: toLocalInputValue(event.endDate),
      location: event.location ?? "",
      address: event.address ?? "",
      summary: event.summary ?? "",
      description: event.description ?? "",
      externalLink: event.externalLink ?? "",
      status: nextStatus,
      imageId: getImageId(event)
    });
    setImageFile(null);
  };

  const uploadImage = async (file: File, alt: string) => {
    const body = new FormData();
    body.append("file", file);
    body.append("alt", alt);
    const response = await fetch("/api/media", {
      method: "POST",
      credentials: "include",
      body
    });

    if (!response.ok) {
      throw new Error("Impossible d'uploader l'image.");
    }

    const data = await response.json();
    return data.doc?.id ?? data.id;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsBusy(true);

    try {
      let imageId = form.imageId ?? null;
      if (imageFile) {
        imageId = await uploadImage(imageFile, form.title || "Evenement");
      }

      const payload = {
        title: form.title.trim(),
        startDate: toISODate(form.startDate),
        endDate: form.endDate ? toISODate(form.endDate) : null,
        location: form.location.trim(),
        address: form.address.trim() || null,
        summary: form.summary.trim(),
        description: form.description.trim() || null,
        externalLink: form.externalLink.trim() || null,
        status: form.status,
        image: imageId ?? null
      };

      if (!payload.title || !payload.startDate || !payload.location || !payload.summary) {
        throw new Error("Merci de remplir les champs obligatoires.");
      }

      const url = selectedId ? `/api/events/${selectedId}` : "/api/events";
      const method = selectedId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Impossible d'enregistrer l'evenement.");
      }

      await loadEvents();
      setMessage({ tone: "success", text: "Evenement enregistre." });
      if (!selectedId) {
        resetForm();
      }
    } catch (error) {
      setMessage({ tone: "error", text: getErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setMessage(null);
    setIsBusy(true);
    try {
      const response = await fetch(`/api/events/${selectedId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }

      await loadEvents();
      resetForm();
      setMessage({ tone: "success", text: "Evenement supprime." });
    } catch (error) {
      setMessage({ tone: "error", text: getErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  if (isBooting) {
    return (
      <div className={`${shellClass} space-y-4`}>
        <PageTitle title="Espace agenda" />
        <p className="text-slate">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${shellClass} flex justify-center`}>
        <div className="mx-auto w-full max-w-lg space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-widest text-slate">Gestion agenda</p>
          <PageTitle title="Connexion" />
          <p className="text-slate">
            Connectez-vous pour gerer les evenements et valider les publications.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ink/70 transition hover:bg-goldSoft"
          >
            Retour au site
          </a>
        </header>
        <Card className="p-6 space-y-4">
          {message && (
            <div
              className={clsx(
                "rounded-xl border px-4 py-3 text-sm",
                message.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}
            >
              {message.text}
            </div>
          )}
          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate">Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="w-full glass-input"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate">Mot de passe</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full glass-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(28,50,156,0.35)] transition hover:bg-ink disabled:opacity-60"
            >
              {isBusy ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shellClass} space-y-8`}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate">Gestion agenda</p>
          <PageTitle title="Espace agenda" />
          <p className="text-slate max-w-2xl">
            Ajoutez et suivez les evenements locaux. Sans la permission de publication
            directe, les modifications passent en attente de validation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/"
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 transition hover:bg-goldSoft"
          >
            Retour au site
          </a>
          <div className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs uppercase tracking-widest text-slate">
            {user.name || user.email} - {user.role === "admin" ? "Admin" : "Utilisateur"}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-goldSoft disabled:opacity-60"
            disabled={isBusy}
          >
            Se deconnecter
          </button>
        </div>
      </header>

      {message && (
        <div
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm",
            message.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card className="p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-display">Evenements</h2>
              <p className="text-sm text-slate">Liste des evenements planifies.</p>
            </div>
            {canEdit ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink transition hover:bg-goldSoft"
              >
                Nouveau
              </button>
            ) : (
              <span className="text-xs uppercase tracking-widest text-slate">
                Lecture seule
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="search"
              placeholder="Rechercher un titre ou un lieu"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full glass-input md:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest">
              {(["all", "draft", "review", "published"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 transition",
                    statusFilter === value
                      ? "bg-accent text-white border-accent"
                      : "bg-white border-ink/10 text-ink hover:bg-goldSoft"
                  )}
                >
                  {value === "all" ? "Tous" : statusLabels[value]}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-sm text-slate">Aucun evenement pour ce filtre.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={clsx(
                    "rounded-xl border border-ink/10 bg-white p-4 shadow-card transition",
                    selectedId === String(event.id) && "ring-2 ring-accent"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={clsx("badge", statusStyles[event.status])}>
                      {statusLabels[event.status]}
                    </span>
                    <span className="text-xs text-slate">{formatDateTime(event.startDate)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-display">{event.title}</h3>
                  <p className="text-sm text-slate">{event.location}</p>
                  {event.endDate && (
                    <p className="text-xs text-slate">
                      Fin: {formatDateTime(event.endDate)}
                    </p>
                  )}
                  {getImageUrl(event) && (
                    <img
                      src={getImageUrl(event) ?? undefined}
                      alt={event.title}
                      className="mt-3 h-24 w-full rounded-xl object-cover"
                    />
                  )}
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => handleSelectEvent(event)}
                      className="mt-3 text-xs font-semibold uppercase tracking-widest text-accent hover:text-ink"
                    >
                      Modifier
                    </button>
                  ) : (
                    <p className="mt-3 text-xs uppercase tracking-widest text-slate">
                      Lecture seule
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {canEdit ? (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display">
                  {selectedId ? "Modifier" : "Creer"} un evenement
                </h2>
                <p className="text-sm text-slate">
                  Champs obligatoires: titre, dates, lieu, resume.
                </p>
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">Titre</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="w-full glass-input"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-slate">
                    Debut
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({ ...form, startDate: event.target.value })
                    }
                    className="w-full glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-slate">
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                    className="w-full glass-input"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">Lieu</label>
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  className="w-full glass-input"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">
                  Adresse
                </label>
                <input
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">
                  Resume
                </label>
                <textarea
                  value={form.summary}
                  onChange={(event) => setForm({ ...form, summary: event.target.value })}
                  className="h-24 w-full glass-input"
                  required
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate">Description</p>
                <RichTextEditor
                  value={form.description ?? ""}
                  onChange={(value) => setForm({ ...form, description: value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">
                  Lien externe
                </label>
                <input
                  value={form.externalLink}
                  onChange={(event) =>
                    setForm({ ...form, externalLink: event.target.value })
                  }
                  placeholder="https://"
                  className="w-full glass-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">
                  Image
                </label>
                {selectedEvent && getImageUrl(selectedEvent) && !imageFile && (
                  <img
                    src={getImageUrl(selectedEvent) ?? undefined}
                    alt={selectedEvent.title}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  className="w-full glass-input"
                />
                <p className="text-xs text-slate">
                  Optionnel. L'image actuelle reste si vide.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-slate">Statut</label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as AgendaEvent["status"] })
                  }
                  className="w-full glass-input"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {statusLabels[option]}
                    </option>
                  ))}
                </select>
                {!canPublish && (
                  <p className="text-xs text-slate">
                    Sans la permission de publication directe, la publication passe en
                    attente.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(28,50,156,0.35)] transition hover:bg-ink disabled:opacity-60"
                >
                  {isBusy ? "Enregistrement..." : "Enregistrer"}
                </button>
                {selectedId && canEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isBusy}
                    className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 space-y-3">
            <div>
              <h2 className="text-xl font-display">Acces restreint</h2>
              <p className="text-sm text-slate">
                Vous n'avez pas les droits pour modifier l'agenda.
              </p>
            </div>
            <p className="text-sm text-slate">
              Demandez a un administrateur d'activer la permission "Agenda".
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
