"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { SearchInput } from "@/components/SearchInput";
import { formatDate } from "@/lib/data";
import { RichTextEditor } from "@/components/RichTextEditor";

type ActualiteItem = {
  id: string | number;
  title: string;
  slug: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  sources: { label: string; url: string }[];
  images?: ActualiteImage[];
  attachments?: ActualiteAttachment[];
  status?: "draft" | "review" | "published";
};

type ActualitesListProps = {
  items: ActualiteItem[];
  allowEdit?: boolean;
};

type AdminUser = {
  email?: string;
  name?: string;
  role?: "admin" | "editor";
};

type ActualiteFormState = {
  title: string;
  slug: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  sources: { label: string; url: string }[];
  images: ActualiteImageFormState[];
  attachments: ActualiteAttachmentFormState[];
  status: "draft" | "review" | "published";
};

type ActualiteImage = {
  image?: { id?: string; url?: string; alt?: string } | string | null;
  alt?: string | null;
};

type ActualiteAttachment = {
  file?: { id?: string; url?: string; filename?: string } | string | null;
  label?: string | null;
};

type ActualiteImageFormState = {
  file: File | null;
  alt: string;
  existingImageUrl: string | null;
  existingImageId: string | null;
};

type ActualiteAttachmentFormState = {
  file: File | null;
  label: string;
  existingFileUrl: string | null;
  existingFileId: string | null;
  existingFileName: string | null;
};

const emptyFormState: ActualiteFormState = {
  title: "",
  slug: "",
  date: "",
  category: "",
  summary: "",
  content: "",
  sources: [{ label: "", url: "" }],
  images: [],
  attachments: [],
  status: "published"
};

const options = {
  keys: ["title", "summary", "category"],
  threshold: 0.35
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const toISODate = (value: string) => {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toISOString();
};

const getImageMeta = (item?: ActualiteImage | null) => {
  if (!item) {
    return { id: null, url: null, alt: null };
  }
  if (!item.image) {
    return { id: null, url: null, alt: item.alt ?? null };
  }
  if (typeof item.image === "string") {
    return { id: item.image, url: null, alt: item.alt ?? null };
  }
  return {
    id: item.image.id ?? null,
    url: item.image.url ?? null,
    alt: item.alt ?? item.image.alt ?? null
  };
};

const getAttachmentMeta = (item?: ActualiteAttachment | null) => {
  if (!item) {
    return { id: null, url: null, filename: null, label: null };
  }
  if (!item.file) {
    return { id: null, url: null, filename: null, label: item.label ?? null };
  }
  if (typeof item.file === "string") {
    return { id: item.file, url: null, filename: null, label: item.label ?? null };
  }
  return {
    id: item.file.id ?? null,
    url: item.file.url ?? null,
    filename: item.file.filename ?? null,
    label: item.label ?? item.file.filename ?? null
  };
};

const fetchActualites = async () => {
  const response = await fetch("/api/actualites?depth=1&limit=200&sort=-date", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as ActualiteItem[];
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
    throw new Error("Upload image impossible.");
  }

  const data = await response.json();
  return data?.doc?.id ?? data?.id ?? null;
};

const uploadAttachment = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/files", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Upload PDF impossible.");
  }

  const data = await response.json();
  return data?.doc?.id ?? data?.id ?? null;
};

export const ActualitesList = ({ items, allowEdit }: ActualitesListProps) => {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [newsItems, setNewsItems] = useState<ActualiteItem[]>(items);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<ActualiteFormState>(emptyFormState);

  const fuse = useMemo(() => new Fuse(newsItems, options), [newsItems]);
  const results = query ? fuse.search(query).map((result) => result.item) : newsItems;
  const sortedResults = useMemo(() => {
    const next = [...results];
    next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return next;
  }, [results]);

  const canEdit = Boolean(user);
  const canDelete = user?.role === "admin";

  const statusOptions = useMemo(() => {
    if (user?.role === "admin") {
      return ["draft", "review", "published"] as const;
    }
    return ["draft", "review"] as const;
  }, [user?.role]);

  useEffect(() => {
    if (!allowEdit) return;
    let isActive = true;
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
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
    if (!canEdit) return;
    let isActive = true;
    const refresh = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchActualites();
        if (!isActive) return;
        setNewsItems(docs);
      } catch {
        if (isActive) setNewsItems((prev) => prev);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    refresh();

    return () => {
      isActive = false;
    };
  }, [canEdit, items]);

  const openCreate = () => {
    setFormState({
      ...emptyFormState,
      date: toDateInputValue(new Date().toISOString())
    });
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: ActualiteItem) => {
    setFormState({
      title: item.title ?? "",
      slug: item.slug ?? "",
      date: toDateInputValue(item.date),
      category: item.category ?? "",
      summary: item.summary ?? "",
      content: item.content ?? "",
      sources: item.sources && item.sources.length > 0 ? item.sources : [{ label: "", url: "" }],
      images:
        item.images?.map((imageItem) => {
          const meta = getImageMeta(imageItem);
          return {
            file: null,
            alt: meta.alt ?? "",
            existingImageUrl: meta.url,
            existingImageId: meta.id
          };
        }) ?? [],
      attachments:
        item.attachments?.map((attachment) => {
          const meta = getAttachmentMeta(attachment);
          return {
            file: null,
            label: meta.label ?? "",
            existingFileUrl: meta.url,
            existingFileId: meta.id,
            existingFileName: meta.filename
          };
        }) ?? [],
      status: item.status ?? "published"
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
      const cleanedSources = formState.sources
        .map((source) => ({
          label: source.label.trim(),
          url: source.url.trim()
        }))
        .filter((source) => source.label && source.url);

      const imagesPayload: { image: string | number; alt?: string }[] = [];
      for (const image of formState.images) {
        if (image.file) {
          const uploadedId = await uploadImage(image.file, image.alt.trim());
          if (uploadedId) {
            imagesPayload.push({
              image: uploadedId,
              alt: image.alt.trim() || undefined
            });
          }
          continue;
        }

        if (image.existingImageId) {
          imagesPayload.push({
            image: image.existingImageId,
            alt: image.alt.trim() || undefined
          });
        }
      }

      const attachmentsPayload: { file: string | number; label?: string }[] = [];
      for (const attachment of formState.attachments) {
        if (attachment.file) {
          const uploadedId = await uploadAttachment(attachment.file);
          if (uploadedId) {
            attachmentsPayload.push({
              file: uploadedId,
              label: attachment.label.trim() || undefined
            });
          }
          continue;
        }

        if (attachment.existingFileId) {
          attachmentsPayload.push({
            file: attachment.existingFileId,
            label: attachment.label.trim() || undefined
          });
        }
      }

      const payload = {
        title: formState.title.trim(),
        slug: formState.slug.trim() || undefined,
        date: toISODate(formState.date),
        category: formState.category.trim(),
        summary: formState.summary.trim(),
        content: formState.content.trim(),
        sources: cleanedSources,
        images: imagesPayload,
        attachments: attachmentsPayload,
        status: formState.status
      };

      const response = await fetch(
        editingId ? `/api/actualites/${editingId}` : "/api/actualites",
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

      const docs = await fetchActualites();
      setNewsItems(docs);
      closeModal();
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: ActualiteItem) => {
    const itemId = item.id;
    if (
      itemId === null ||
      itemId === undefined ||
      (typeof itemId === "string" && !/^\d+$/.test(itemId))
    ) {
      setFormError("Suppression impossible pour cet element.");
      return;
    }
    if (!window.confirm("Supprimer cette actualite ?")) {
      return;
    }
    setDeletingId(itemId);
    try {
      await fetch(`/api/actualites/${itemId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const docs = await fetchActualites();
      setNewsItems(docs);
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
            >
              Ajouter une actualite
            </button>
          </div>
        </div>
      ) : null}

      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une actualite" />

      {isLoading ? <p className="text-sm text-slate">Chargement...</p> : null}

      {sortedResults.length === 0 ? (
        <p className="text-sm text-slate">Aucun resultat ne correspond a cette recherche.</p>
      ) : (
        <div className="card-grid">
          {sortedResults.map((item) => {
            const imageMeta = getImageMeta(item.images?.[0]);
            const imageUrl = imageMeta.url ?? null;
            const imageAlt = imageMeta.alt ?? item.title;

            return (
              <Card key={String(item.id)} className="p-6 flex flex-col gap-3">
                <div className="h-36 overflow-hidden rounded-xl border border-ink/10 bg-gradient-to-br from-accent/15 via-white to-gold/30">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="accent">{item.category}</Badge>
                  <span className="text-xs text-slate">{formatDate(item.date)}</span>
                </div>
                <h3 className="text-lg font-display">{item.title}</h3>
                <p className="text-sm text-slate flex-1">{item.summary}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button href={`/actualites/${item.slug}`} variant="secondary" className="self-start">
                    Lire
                  </Button>
                  {canEdit ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
                      >
                        Modifier
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? "Suppression..." : "Supprimer"}
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </Card>
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
                  Actualite
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Modifier l'actualite" : "Nouvelle actualite"}
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
                  Categorie
                  <input
                    type="text"
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-ink/80">
                  Date
                  <input
                    type="date"
                    value={formState.date}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, date: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-ink/80">
                  Slug (optionnel)
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </label>
              </div>

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
                <p>Contenu</p>
                <div className="mt-2">
                  <RichTextEditor
                    value={formState.content}
                    onChange={(value) =>
                      setFormState((prev) => ({ ...prev, content: value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                    Images
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        images: [
                          ...prev.images,
                          { file: null, alt: "", existingImageUrl: null, existingImageId: null }
                        ]
                      }))
                    }
                    className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60"
                  >
                    Ajouter
                  </button>
                </div>
                {formState.images.length === 0 ? (
                  <p className="text-xs text-slate">Aucune image ajoutee pour le moment.</p>
                ) : null}
                <div className="space-y-3">
                  {formState.images.map((image, index) => (
                    <div
                      key={`image-${index}`}
                      className="rounded-2xl border border-ink/10 p-4 space-y-3"
                    >
                      {image.existingImageUrl ? (
                        <a
                          href={image.existingImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
                        >
                          Voir l'image actuelle
                        </a>
                      ) : null}
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-ink/80">
                          Fichier
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setFormState((prev) => ({
                                ...prev,
                                images: prev.images.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        file,
                                        ...(file
                                          ? { existingImageId: null, existingImageUrl: null }
                                          : {})
                                      }
                                    : item
                                )
                              }));
                            }}
                            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                          />
                        </label>
                        <label className="block text-sm font-semibold text-ink/80">
                          Texte alternatif
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(event) => {
                              const value = event.target.value;
                              setFormState((prev) => ({
                                ...prev,
                                images: prev.images.map((item, i) =>
                                  i === index ? { ...item, alt: value } : item
                                )
                              }));
                            }}
                            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                          />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))
                          }
                          className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                    Documents PDF
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        attachments: [
                          ...prev.attachments,
                          {
                            file: null,
                            label: "",
                            existingFileUrl: null,
                            existingFileId: null,
                            existingFileName: null
                          }
                        ]
                      }))
                    }
                    className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60"
                  >
                    Ajouter
                  </button>
                </div>
                {formState.attachments.length === 0 ? (
                  <p className="text-xs text-slate">Aucun PDF ajoute pour le moment.</p>
                ) : null}
                <div className="space-y-3">
                  {formState.attachments.map((attachment, index) => (
                    <div
                      key={`attachment-${index}`}
                      className="rounded-2xl border border-ink/10 p-4 space-y-3"
                    >
                      {attachment.existingFileUrl ? (
                        <a
                          href={attachment.existingFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70"
                        >
                          Voir le PDF actuel
                        </a>
                      ) : null}
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-ink/80">
                          Fichier (PDF)
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setFormState((prev) => ({
                                ...prev,
                                attachments: prev.attachments.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        file,
                                        ...(file
                                          ? {
                                              existingFileId: null,
                                              existingFileUrl: null,
                                              existingFileName: null
                                            }
                                          : {})
                                      }
                                    : item
                                )
                              }));
                            }}
                            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                          />
                        </label>
                        <label className="block text-sm font-semibold text-ink/80">
                          Titre
                          <input
                            type="text"
                            value={attachment.label}
                            onChange={(event) => {
                              const value = event.target.value;
                              setFormState((prev) => ({
                                ...prev,
                                attachments: prev.attachments.map((item, i) =>
                                  i === index ? { ...item, label: value } : item
                                )
                              }));
                            }}
                            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                          />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== index)
                            }))
                          }
                          className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                    Sources
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        sources: [...prev.sources, { label: "", url: "" }]
                      }))
                    }
                    className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="space-y-3">
                  {formState.sources.map((source, index) => (
                    <div key={`${source.label}-${index}`} className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Titre"
                        value={source.label}
                        onChange={(event) => {
                          const value = event.target.value;
                          setFormState((prev) => ({
                            ...prev,
                            sources: prev.sources.map((item, i) =>
                              i === index ? { ...item, label: value } : item
                            )
                          }));
                        }}
                        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="URL"
                          value={source.url}
                          onChange={(event) => {
                            const value = event.target.value;
                            setFormState((prev) => ({
                              ...prev,
                              sources: prev.sources.map((item, i) =>
                                i === index ? { ...item, url: value } : item
                              )
                            }));
                          }}
                          className="flex-1 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormState((prev) => ({
                              ...prev,
                              sources: prev.sources.filter((_, i) => i !== index)
                            }))
                          }
                          className="rounded-2xl border border-ink/10 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
