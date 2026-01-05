"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent
} from "react";
import clsx from "clsx";
import { Card } from "@/components/Card";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type HistoryImage =
  | {
      id?: string;
      _id?: string;
      url?: string;
      alt?: string;
    }
  | string
  | null;

type HistorySection = {
  id: string | number;
  title: string;
  period?: string | null;
  content: string;
  status?: "draft" | "published";
  order?: number | null;
  image?: HistoryImage;
  imageAlt?: string | null;
  isFallback?: boolean;
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type SectionFormState = {
  title: string;
  period: string;
  content: string;
  status: "draft" | "published";
  order: string;
  imageFile: File | null;
  imageAlt: string;
  existingImageUrl: string | null;
  existingImageId: string | null;
};

const emptyFormState: SectionFormState = {
  title: "",
  period: "",
  content: "",
  status: "published",
  order: "1",
  imageFile: null,
  imageAlt: "",
  existingImageUrl: null,
  existingImageId: null
};

const cropRatio = 4 / 3;
const minZoom = 0.6;

const parseParagraphs = (value: string) =>
  value
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

const getImageMeta = (image?: HistoryImage, fallbackAlt?: string | null) => {
  if (!image) {
    return { id: null, url: null, alt: fallbackAlt ?? null };
  }
  if (typeof image === "string") {
    return { id: image, url: null, alt: fallbackAlt ?? null };
  }

  return {
    id: image.id ?? image._id ?? null,
    url: image.url ?? null,
    alt: image.alt ?? fallbackAlt ?? null
  };
};

const fetchSections = async () => {
  const response = await fetch("/api/history-sections?depth=1&limit=200&sort=order", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as HistorySection[];
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

export const HistoireClient = ({ initialSections }: { initialSections: HistorySection[] }) => {
  const [sections, setSections] = useState<HistorySection[]>(initialSections);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoteEmpty, setIsRemoteEmpty] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<SectionFormState>(emptyFormState);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [didAdjustCrop, setDidAdjustCrop] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 480, height: 360 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });

  const canEdit = hasPermission(user, "manageHistorySections");

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
        if (isActive) {
          setUser(data?.user ?? null);
        }
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
    let isActive = true;
    const refresh = async () => {
      if (!canEdit) return;
      setIsLoading(true);
      try {
        const docs = await fetchSections();
        if (!isActive) return;
        if (docs.length > 0) {
          setSections(docs);
          setIsRemoteEmpty(false);
        } else {
          setIsRemoteEmpty(true);
          setSections((prev) => (prev.length > 0 ? prev : docs));
        }
      } catch {
        if (isActive) setSections((prev) => prev);
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
    if (formState.imageFile) {
      const previewUrl = URL.createObjectURL(formState.imageFile);
      objectUrlRef.current = previewUrl;
      setPhotoPreviewUrl(previewUrl);
    } else {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPhotoPreviewUrl(formState.existingImageUrl);
    }

    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImage(null);
    setDidAdjustCrop(false);
  }, [formState.imageFile, formState.existingImageUrl]);

  useEffect(() => {
    if (!photoPreviewUrl) {
      setCropImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setCropImage({ url: photoPreviewUrl, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = photoPreviewUrl;
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (!isModalOpen) return;
    const updateSize = () => {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isModalOpen, photoPreviewUrl]);

  const sortedSections = useMemo(() => {
    const next = [...sections];
    next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return next;
  }, [sections]);

  const getCropMetrics = (zoom = cropZoom) => {
    if (!cropImage) return null;
    const baseScale = Math.max(
      viewportSize.width / cropImage.width,
      viewportSize.height / cropImage.height
    );
    const scale = baseScale * zoom;
    const displayWidth = cropImage.width * scale;
    const displayHeight = cropImage.height * scale;
    const maxOffsetX = Math.max(0, (displayWidth - viewportSize.width) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - viewportSize.height) / 2);
    return { scale, displayWidth, displayHeight, maxOffsetX, maxOffsetY };
  };

  const clampOffset = (nextX: number, nextY: number, zoom = cropZoom) => {
    const metrics = getCropMetrics(zoom);
    if (!metrics) return { x: nextX, y: nextY };
    return {
      x: Math.max(-metrics.maxOffsetX, Math.min(metrics.maxOffsetX, nextX)),
      y: Math.max(-metrics.maxOffsetY, Math.min(metrics.maxOffsetY, nextY))
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropImage) return;
    event.preventDefault();
    setDidAdjustCrop(true);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropOffset.x,
      originY: cropOffset.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    setCropOffset(clampOffset(dragState.originX + deltaX, dragState.originY + deltaY));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.pointerId !== event.pointerId) return;
    dragStateRef.current.pointerId = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const createCroppedFile = async (file: File) => {
    if (!cropImage) return file;
    const metrics = getCropMetrics();
    if (!metrics) return file;

    const imageLeft = (viewportSize.width - metrics.displayWidth) / 2 + cropOffset.x;
    const imageTop = (viewportSize.height - metrics.displayHeight) / 2 + cropOffset.y;
    const cropX = (0 - imageLeft) / metrics.scale;
    const cropY = (0 - imageTop) / metrics.scale;
    const cropWidth = viewportSize.width / metrics.scale;
    const cropHeight = viewportSize.height / metrics.scale;

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Chargement image impossible."));
      img.src = cropImage.url;
    });

    const outputWidth = Math.min(1600, Math.round(cropWidth));
    const outputHeight = Math.round(outputWidth / cropRatio);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const mimeType = file.type?.startsWith("image/") ? file.type : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, 0.92);
    });

    if (!blob) return file;
    const safeName = file.name ? file.name.replace(/\s+/g, "-") : "photo.jpg";
    return new File([blob], `recadre-${safeName}`, { type: blob.type });
  };

  const getSourceFile = async () => {
    if (formState.imageFile) return formState.imageFile;
    if (!photoPreviewUrl) return null;

    const response = await fetch(photoPreviewUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const fileName = photoPreviewUrl.split("/").pop() ?? "photo.jpg";
    return new File([blob], fileName, { type: blob.type || "image/jpeg" });
  };

  const openCreate = () => {
    const nextOrder =
      sortedSections.length > 0 ? Math.max(...sortedSections.map((s) => s.order ?? 0)) + 1 : 1;

    setFormState({
      ...emptyFormState,
      order: String(nextOrder)
    });
    setEditingId(null);
    setRemoveImage(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const seedFallbackSections = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setFormError(null);

    try {
      const fallback = sections.filter((section) => section.isFallback);
      if (fallback.length === 0) {
        setIsSeeding(false);
        return;
      }

      for (const section of fallback) {
        await fetch("/api/history-sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: section.title,
            period: section.period ?? null,
            content: section.content,
            status: section.status ?? "published",
            order: section.order ?? 0
          })
        });
      }

      const docs = await fetchSections();
      setSections(docs);
      setIsRemoteEmpty(false);
    } catch {
      setFormError("Import impossible.");
    } finally {
      setIsSeeding(false);
    }
  };

  const openEdit = (section: HistorySection) => {
    const imageMeta = getImageMeta(section.image, section.imageAlt ?? null);
    setFormState({
      title: section.title ?? "",
      period: section.period ?? "",
      content: section.content ?? "",
      status: section.status ?? "published",
      order: String(section.order ?? 0),
      imageFile: null,
      imageAlt: section.imageAlt ?? imageMeta.alt ?? "",
      existingImageUrl: imageMeta.url ?? null,
      existingImageId: imageMeta.id ?? null
    });
    setEditingId(String(section.id));
    setRemoveImage(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setRemoveImage(false);
    setFormState(emptyFormState);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      let imageId = formState.existingImageId;
      let shouldUpload = Boolean(formState.imageFile) || didAdjustCrop;

      if (removeImage) {
        imageId = null;
        shouldUpload = false;
      }

      if (shouldUpload) {
        const sourceFile = await getSourceFile();
        if (!sourceFile) {
          setFormError("Ajoutez une photo avant d'enregistrer.");
          setIsSaving(false);
          return;
        }
        const croppedFile = await createCroppedFile(sourceFile);
        const fallbackAlt = formState.title.trim() || "Illustration";
        imageId = await uploadImage(croppedFile, formState.imageAlt || fallbackAlt);
      }

      const payload = {
        title: formState.title.trim(),
        period: formState.period.trim() || null,
        content: formState.content.trim(),
        status: formState.status,
        order: Number(formState.order) || 0,
        imageAlt: formState.imageAlt.trim() || null,
        ...(removeImage ? { image: null } : imageId ? { image: imageId } : {})
      };

      const response = await fetch(
        editingId ? `/api/history-sections/${editingId}` : "/api/history-sections",
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
          data?.errors?.[0]?.message ||
          data?.message ||
          "Enregistrement impossible.";
        setFormError(message);
        setIsSaving(false);
        return;
      }

      const docs = await fetchSections();
      setSections(docs);
      closeModal();
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette section ?")) {
      return;
    }
    setDeletingId(id);
    try {
      await fetch(`/api/history-sections/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const docs = await fetchSections();
      setSections(docs);
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  const cropMetrics = useMemo(
    () => getCropMetrics(),
    [cropImage, cropZoom, cropOffset, viewportSize]
  );

  return (
    <div className="space-y-8">
      {canEdit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <span>Mode admin actif</span>
          <div className="flex flex-wrap items-center gap-2">
            {isRemoteEmpty ? (
              <button
                type="button"
                onClick={seedFallbackSections}
                disabled={isSeeding}
                className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSeeding ? "Import..." : "Importer le contenu actuel"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
            >
              Ajouter une section
            </button>
          </div>
        </div>
      ) : null}

      {canEdit && isRemoteEmpty ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
          Contenu par defaut affiche. Importez pour modifier ou supprimer.
        </p>
      ) : null}

      {isLoading ? <p className="text-sm text-slate">Chargement...</p> : null}

      <article className="space-y-12">
        {sortedSections.map((section, index) => {
          const imageMeta = getImageMeta(section.image, section.imageAlt ?? null);
          const paragraphs = parseParagraphs(section.content || "");
          const isReversed = index % 2 === 1;

          return (
            <section
              key={String(section.id)}
              className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center"
            >
              <div className={clsx(isReversed && "lg:order-2")}>
                <div className="space-y-1">
                  {section.period ? (
                    <p className="text-xs uppercase tracking-[0.25em] text-slate">
                      {section.period}
                    </p>
                  ) : null}
                  <h2 className="text-2xl font-display text-ink">{section.title}</h2>
                </div>
                <div className="mt-4 space-y-3 text-slate">
                  {paragraphs.length === 0 ? (
                    <p className="text-sm sm:text-base leading-relaxed">{section.content}</p>
                  ) : (
                    paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm sm:text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  )}
                </div>
                {canEdit && !isRemoteEmpty ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
                    <button
                      type="button"
                      onClick={() => openEdit(section)}
                      className="rounded-full border border-ink/10 px-3 py-2"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(String(section.id))}
                      disabled={deletingId === String(section.id)}
                      className="rounded-full border border-ink/10 px-3 py-2 text-red-600"
                    >
                      {deletingId === String(section.id) ? "Suppression..." : "Supprimer"}
                    </button>
                    {section.status === "draft" ? (
                      <span className="rounded-full border border-ink/10 px-3 py-2 text-[10px] text-slate">
                        Brouillon
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className={clsx(isReversed && "lg:order-1")}>
                <Card className="overflow-hidden">
                  {imageMeta.url ? (
                    <img
                      src={imageMeta.url}
                      alt={imageMeta.alt ?? section.title}
                      className="h-full w-full object-cover"
                      style={{ aspectRatio: `${cropRatio}` }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center bg-fog text-xs uppercase tracking-[0.3em] text-slate"
                      style={{ aspectRatio: `${cropRatio}` }}
                    >
                      Illustration
                    </div>
                  )}
                </Card>
              </div>
            </section>
          );
        })}
      </article>

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
                  Section
                </p>
                <h2 className="mt-2 text-2xl font-display">Modifier le contenu</h2>
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
                  Periode
                  <input
                    type="text"
                    value={formState.period}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, period: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-ink/80">
                Texte
                <textarea
                  value={formState.content}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, content: event.target.value }))
                  }
                  rows={6}
                  className="mt-2 w-full glass-input"
                  required
                />
                <span className="mt-2 block text-[11px] text-slate">
                  Separez les paragraphes par une ligne vide.
                </span>
              </label>

              <div className="grid gap-4 md:grid-cols-3">
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
                <label className="block text-sm font-semibold text-ink/80">
                  Statut
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: event.target.value as "draft" | "published"
                      }))
                    }
                    className="mt-2 w-full glass-input"
                  >
                    <option value="published">Publie</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-ink/80">
                  Texte alternatif
                  <input
                    type="text"
                    value={formState.imageAlt}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, imageAlt: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-ink/80">
                  Illustration
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setFormState((prev) => ({
                        ...prev,
                        imageFile: file
                      }));
                      setRemoveImage(false);
                    }}
                    className="mt-2 block w-full glass-input"
                  />
                </label>

                {formState.existingImageUrl && !formState.imageFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDidAdjustCrop(true);
                      setRemoveImage(false);
                    }}
                    className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60"
                  >
                    Recadrer l'image actuelle
                  </button>
                ) : null}

                {formState.existingImageUrl || formState.imageFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveImage(true);
                      setFormState((prev) => ({
                        ...prev,
                        imageFile: null,
                        existingImageUrl: null,
                        existingImageId: null
                      }));
                    }}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
                  >
                    Retirer l'image
                  </button>
                ) : null}

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                    Recadrage
                  </p>
                  <div
                    ref={viewportRef}
                    className="relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-sand/40"
                    style={{ aspectRatio: `${cropRatio}` }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    {cropImage ? (
                      <div
                        className="absolute left-1/2 top-1/2 h-full w-full cursor-grab"
                        style={{
                          transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px)`
                        }}
                      >
                        <img
                          src={cropImage.url}
                          alt="Apercu recadrage"
                          className="absolute left-1/2 top-1/2 select-none"
                          style={{
                            width: cropImage.width,
                            height: cropImage.height,
                            transform: `translate(-50%, -50%) scale(${cropMetrics?.scale ?? 1})`
                          }}
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate">
                        Ajoutez une photo pour recadrer.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate">
                    <span className="rounded-full border border-ink/10 bg-white px-3 py-1 font-semibold uppercase tracking-[0.2em] text-ink/60">
                      Zoom {cropZoom.toFixed(2)}x
                    </span>
                    <input
                      type="range"
                      min={minZoom}
                      max={2.4}
                      step={0.05}
                      value={cropZoom}
                      onChange={(event) => {
                        const nextZoom = Number(event.target.value);
                        setDidAdjustCrop(true);
                        setCropZoom(nextZoom);
                        setCropOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
                      }}
                      className="w-48 accent-gold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDidAdjustCrop(true);
                        setCropOffset({ x: 0, y: 0 });
                      }}
                      className="rounded-full border border-ink/10 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-ink/60"
                    >
                      Recentrer
                    </button>
                  </div>
                </div>
              </div>

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
