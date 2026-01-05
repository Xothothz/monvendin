"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { HomeHero } from "@/components/HomeHero";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type HeroAdminProps = {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  alt?: string;
  initialImageUrl?: string | null;
  initialHeroId?: string | null;
  showText?: boolean;
  cropRatio?: number;
};

type CropImage = {
  url: string;
  width: number;
  height: number;
};

const defaultCropRatio = 12 / 5;
const defaultViewportWidth = 600;

const uploadHeroImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Upload photo impossible.");
  }

  const data = await response.json();
  const doc = data?.doc ?? data;
  return {
    id: doc?.id ?? doc?._id ?? null,
    url: doc?.url ?? null
  };
};

const fetchHeroBySlug = async (slug: string) => {
  const response = await fetch(
    `/api/page-heroes?depth=1&limit=1&where[slug][equals]=${encodeURIComponent(slug)}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }

  const data = await response.json();
  const doc = data?.docs?.[0];
  const imageUrl = typeof doc?.image === "object" ? doc.image?.url ?? null : null;
  return { id: doc?.id ?? null, imageUrl };
};

export const HeroAdmin = ({
  slug,
  eyebrow,
  title,
  subtitle,
  alt,
  initialImageUrl,
  initialHeroId,
  showText,
  cropRatio
}: HeroAdminProps) => {
  const heroCropRatio = cropRatio ?? defaultCropRatio;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl ?? null);
  const [heroId, setHeroId] = useState<string | null>(initialHeroId ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoSourceUrl, setPhotoSourceUrl] = useState<string | null>(initialImageUrl ?? null);
  const [cropImage, setCropImage] = useState<CropImage | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
  const [heroPreviewRatio, setHeroPreviewRatio] = useState<number | null>(null);
  const [viewportSize, setViewportSize] = useState({
    width: defaultViewportWidth,
    height: Math.round(defaultViewportWidth / heroCropRatio)
  });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
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

  const canEdit = hasPermission(user, "managePageHeroes");

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
    if (photoFile) {
      const nextUrl = URL.createObjectURL(photoFile);
      objectUrlRef.current = nextUrl;
      setPhotoSourceUrl(nextUrl);
    } else {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPhotoSourceUrl(imageUrl);
    }
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImage(null);
  }, [photoFile, imageUrl]);

  useEffect(() => {
    if (!photoSourceUrl) {
      setCropImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setCropImage({ url: photoSourceUrl, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = photoSourceUrl;
  }, [photoSourceUrl]);

  useEffect(() => {
    const updateRatio = () => {
      const width = window.innerWidth;
      const height = width < 640 ? 175 : width < 1024 ? 215 : 255;
      setHeroPreviewRatio(width / height);
    };
    updateRatio();
    window.addEventListener("resize", updateRatio);
    return () => window.removeEventListener("resize", updateRatio);
  }, []);

  useEffect(() => {
    let isActive = true;
    const buildPreview = async () => {
      if (!cropImage) {
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        if (isActive) setCropPreviewUrl(null);
        return;
      }

      const metrics = getCropMetrics();
      if (!metrics) return;

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

      const outputWidth = Math.min(800, Math.round(cropWidth));
      const outputHeight = Math.round(outputWidth * (viewportSize.height / viewportSize.width));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
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

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob || !isActive) return;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(blob);
      previewUrlRef.current = previewUrl;
      setCropPreviewUrl(previewUrl);
    };

    buildPreview().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [cropImage, cropOffset, cropZoom, viewportSize]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

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
  }, [isModalOpen, photoSourceUrl]);

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

    const outputWidth = Math.min(2000, Math.round(cropWidth));
    const outputHeight = Math.round(outputWidth * (viewportSize.height / viewportSize.width));

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
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
      canvas.toBlob(resolve, mimeType, 0.9);
    });

    if (!blob) return file;
    const safeName = file.name ? file.name.replace(/\s+/g, "-") : "hero.jpg";
    return new File([blob], `recadre-${safeName}`, { type: blob.type });
  };

  const getSourceFile = async () => {
    if (photoFile) return photoFile;
    if (!photoSourceUrl) return null;

    const response = await fetch(photoSourceUrl);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    const fileName = photoSourceUrl.split("/").pop() ?? "hero.jpg";
    return new File([blob], fileName, { type: blob.type || "image/jpeg" });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const sourceFile = await getSourceFile();
      if (!sourceFile) {
        setFormError("Ajoutez une photo avant d'enregistrer.");
        setIsSaving(false);
        return;
      }

      const croppedFile = await createCroppedFile(sourceFile);
      const upload = await uploadHeroImage(croppedFile);
      if (!upload.id) {
        throw new Error("Upload impossible.");
      }

      const payload = heroId ? { image: upload.id } : { slug, image: upload.id };
      const response = await fetch(heroId ? `/api/page-heroes/${heroId}` : "/api/page-heroes", {
        method: heroId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

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

      const data = await response.json().catch(() => ({}));
      const nextId = data?.doc?.id ?? data?.id ?? heroId;
      setHeroId(nextId ?? heroId);
      if (upload.url) {
        setImageUrl(upload.url);
      } else {
        const refreshed = await fetchHeroBySlug(slug);
        setHeroId(refreshed.id);
        setImageUrl(refreshed.imageUrl);
      }

      setIsModalOpen(false);
      setPhotoFile(null);
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const cropMetrics = useMemo(
    () => getCropMetrics(),
    [cropImage, cropZoom, cropOffset, viewportSize]
  );

  return (
    <>
      <HomeHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        image={imageUrl ?? undefined}
        alt={alt}
        showText={showText}
        actions={
          canEdit ? (
            <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              <span>Mode admin</span>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setPhotoFile(null);
                  setIsModalOpen(true);
                }}
                className="rounded-full border border-white/60 bg-white/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/50"
              >
                Modifier la photo
              </button>
            </div>
          ) : null
        }
      />

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={() => {
              setFormError(null);
              setPhotoFile(null);
              setIsModalOpen(false);
            }}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Banniere
                </p>
                <h2 className="mt-2 text-2xl font-display">Recadrer la photo</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setPhotoFile(null);
                  setIsModalOpen(false);
                }}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSave}>
              <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
                <label className="block text-sm font-semibold text-ink/80">
                  Photo du bandeau
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setPhotoFile(file);
                    }}
                    className="mt-2 block w-full glass-input"
                  />
                </label>
                <div className="glass-panel p-3 text-xs text-slate">
                  <p className="font-semibold uppercase tracking-[0.28em] text-slate">
                    Apercu
                  </p>
                  <div
                    className="mt-3 w-full overflow-hidden rounded-xl border border-ink/10 bg-sand/40"
                    style={{ aspectRatio: `${heroPreviewRatio ?? heroCropRatio}` }}
                  >
                    {cropPreviewUrl ? (
                      <div className="relative h-full w-full">
                        <div
                          className="absolute inset-0 bg-cover bg-bottom"
                          style={{ backgroundImage: `url(${cropPreviewUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate">
                        Aucun apercu
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
                  Recadrage
                </p>
                <div
                  ref={viewportRef}
                  className="relative w-full max-w-[600px] overflow-hidden rounded-3xl bg-sand/40"
                  style={{ aspectRatio: `${heroCropRatio}` }}
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
                    min={0.6}
                    max={3.5}
                    step={0.05}
                    value={cropZoom}
                    onChange={(event) => {
                      const nextZoom = Number(event.target.value);
                      setCropZoom(nextZoom);
                      setCropOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
                    }}
                    className="w-48 accent-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setCropOffset({ x: 0, y: 0 })}
                    className="rounded-full border border-ink/10 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-ink/60"
                  >
                    Recentrer
                  </button>
                </div>
              </div>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setPhotoFile(null);
                    setIsModalOpen(false);
                  }}
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
