"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { RichTextEditor } from "@/components/RichTextEditor";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";
import { LightboxImage } from "@/components/LightboxImage";
import { PdfLightboxButton } from "@/components/PdfLightboxButton";
import { Card } from "@/components/Card";
import { FacebookComments } from "@/components/FacebookComments";

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

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
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

const normalizeItem = (item: ActualiteItem): ActualiteItem => ({
  ...item,
  sources: item.sources?.length ? item.sources : [],
  images: item.images?.length ? item.images : [],
  attachments: item.attachments?.length ? item.attachments : []
});

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

const formatStatus = (status?: "draft" | "review" | "published") => {
  if (status === "draft") return "Brouillon";
  if (status === "review") return "En attente";
  if (status === "published") return "Publie";
  return "";
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

export const ActualiteDetailClient = ({
  initialItem,
  commentsUrl
}: {
  initialItem: ActualiteItem;
  commentsUrl?: string;
}) => {
  const router = useRouter();
  const [item, setItem] = useState<ActualiteItem>(() => normalizeItem(initialItem));
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<ActualiteFormState>(emptyFormState);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const canEdit = hasPermission(user, "manageActualites");
  const canDelete = canEdit;

  const statusOptions = useMemo(() => {
    if (hasPermission(user, "canPublish")) {
      return ["draft", "review", "published"] as const;
    }
    return ["draft", "review"] as const;
  }, [user]);

  const contentHtml = useMemo(() => renderMarkdown(item.content ?? ""), [item.content]);
  const galleryItems = useMemo(() => {
    return (item.images ?? [])
      .map((imageItem) => {
        const meta = getImageMeta(imageItem);
        return {
          url: meta.url,
          alt: meta.alt ?? `Actualite: ${item.title}`
        };
      })
      .filter((imageItem) => Boolean(imageItem.url));
  }, [item.images, item.title]);

  const attachmentItems = useMemo(() => {
    return (item.attachments ?? [])
      .map((attachment) => {
        const meta = getAttachmentMeta(attachment);
        return {
          id: meta.id,
          url: meta.url,
          filename: meta.filename,
          label: meta.label ?? meta.filename ?? "Document PDF"
        };
      })
      .filter((attachment) => Boolean(attachment.url));
  }, [item.attachments]);

  useEffect(() => {
    if (activeImageIndex >= galleryItems.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, galleryItems.length]);

  useEffect(() => {
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
  }, []);

  const openEdit = () => {
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
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
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

      const isEditing = item.id !== undefined && item.id !== null;
      const endpoint = isEditing
        ? `/api/actualites/${item.id}?depth=1`
        : "/api/actualites?depth=1";
      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.errors?.[0]?.message || data?.message || "Enregistrement impossible.";
        setFormError(message);
        setIsSaving(false);
        return;
      }

      const data = await response.json();
      const updated = (data?.doc ?? data) as ActualiteItem;
      const nextItem = normalizeItem(updated);
      setItem(nextItem);
      closeModal();
      if (updated?.slug && updated.slug !== item.slug && updated.status === "published") {
        router.push(`/actualites/${updated.slug}`);
      }
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item.id) return;
    if (!window.confirm("Supprimer cette actualite ?")) {
      return;
    }

    setIsDeleting(true);
    setFormError(null);
    try {
      const response = await fetch(`/api/actualites/${item.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        setFormError("Suppression impossible.");
        return;
      }
      router.push("/actualites");
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">

      {canEdit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <span>Mode admin actif</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openEdit}
              className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
            >
              Modifier l'actualite
            </button>
            {canDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full border border-ink/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {formError && !isModalOpen ? <p className="text-sm text-red-600">{formError}</p> : null}

      {galleryItems.length ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
          <Card className="p-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">{item.category}</Badge>
              {canEdit && item.status ? <Badge>{formatStatus(item.status)}</Badge> : null}
            </div>
            <PageTitle title={item.title} watermark="Actualites" />
            <p className="text-sm text-slate">{formatDate(item.date)}</p>
            {item.summary ? <p className="text-slate">{item.summary}</p> : null}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate">
              <span>
                Image {activeImageIndex + 1} / {galleryItems.length}
              </span>
              {galleryItems.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? galleryItems.length - 1 : prev - 1
                      )
                    }
                    className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                  >
                    Precedent
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === galleryItems.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                  >
                    Suivant
                  </button>
                </div>
              ) : null}
            </div>
            <LightboxImage
              src={galleryItems[activeImageIndex]?.url ?? ""}
              alt={galleryItems[activeImageIndex]?.alt ?? ""}
              previewClassName="h-[260px] w-full rounded-2xl border border-ink/10 bg-sand object-contain transition duration-200 hover:scale-[1.02]"
              showNav={galleryItems.length > 1}
              counterLabel={`Image ${activeImageIndex + 1} / ${galleryItems.length}`}
              onPrev={
                galleryItems.length > 1
                  ? () =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? galleryItems.length - 1 : prev - 1
                      )
                  : undefined
              }
              onNext={
                galleryItems.length > 1
                  ? () =>
                      setActiveImageIndex((prev) =>
                        prev === galleryItems.length - 1 ? 0 : prev + 1
                      )
                  : undefined
              }
            />
            <p className="text-xs text-slate">Cliquez sur l'image pour l'agrandir.</p>
            {galleryItems.length > 1 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryItems.map((image, index) => (
                  <button
                    key={`thumb-${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition ${
                      index === activeImageIndex
                        ? "border-ink/60 ring-2 ring-ink/10"
                        : "border-ink/10"
                    }`}
                    aria-label={`Image ${index + 1}`}
                  >
                    <img
                      src={image.url ?? ""}
                      alt={image.alt ?? ""}
                      className="h-full w-full object-contain bg-white"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </Card>
        </section>
      ) : (
        <Card className="p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">{item.category}</Badge>
            {canEdit && item.status ? <Badge>{formatStatus(item.status)}</Badge> : null}
          </div>
          <PageTitle title={item.title} watermark="Actualites" />
          <p className="text-sm text-slate">{formatDate(item.date)}</p>
          {item.summary ? <p className="text-slate max-w-2xl">{item.summary}</p> : null}
        </Card>
      )}

      <Card className="p-6">
        <article
          className="text-slate space-y-4"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </Card>

      {attachmentItems.length ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-display">Documents PDF</h2>
          <div className="space-y-3">
            {attachmentItems.map((attachment, index) => (
              <div
                key={`attachment-${attachment.id ?? index}`}
              className="flex flex-wrap items-center justify-between gap-3 glass-panel px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{attachment.label}</p>
                  {attachment.filename ? (
                    <p className="text-xs text-slate">{attachment.filename}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <PdfLightboxButton
                    src={attachment.url ?? "#"}
                    label="Consulter"
                    title={attachment.label}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                  />
                  <a
                    href={attachment.url ?? "#"}
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
                  >
                    Telecharger
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {item.sources?.length ? (
        <section className="text-sm">
          <h2 className="text-lg font-display">Sources</h2>
          <ul className="mt-2 space-y-1 text-slate">
            {item.sources.map((source) => (
              <li key={`${source.url}-${source.label}`}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {commentsUrl ? (
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                Commentaires
              </p>
              <h2 className="text-lg font-display text-ink">Espace Facebook</h2>
              <p className="text-xs text-slate">
                Connectez-vous a Facebook pour commenter.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#1877F2]">
              Facebook
            </span>
          </div>
          <div className="-mx-3 rounded-2xl border border-ink/10 bg-white/70 p-4 sm:-mx-4">
            <FacebookComments href={commentsUrl} />
          </div>
        </Card>
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
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Actualite
                </p>
                <h2 className="mt-2 text-2xl font-display">Modifier l'actualite</h2>
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
                    className="mt-2 w-full glass-input"
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
                    className="mt-2 w-full glass-input"
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
                    className="mt-2 w-full glass-input"
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
                    className="mt-2 w-full glass-input"
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
                  className="mt-2 w-full glass-input"
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
                            className="mt-2 w-full glass-input"
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
                            className="mt-2 w-full glass-input"
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
                            className="mt-2 w-full glass-input"
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
                            className="mt-2 w-full glass-input"
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
                        className="w-full glass-input"
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
                          className="flex-1 glass-input"
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
                  className="mt-2 w-full glass-input"
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
