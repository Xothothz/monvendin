"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { Card } from "@/components/Card";

type OfficialPhoto =
  | {
      id?: string;
      _id?: string;
      url?: string;
      alt?: string;
    }
  | string
  | null;

type Official = {
  id: string | number;
  firstName: string;
  lastName?: string;
  role: string;
  politicalGroup?: string | null;
  group: "executive" | "council";
  order?: number | null;
  status?: "draft" | "published";
  photo?: OfficialPhoto;
};

type AdminUser = {
  email?: string;
  name?: string;
  role?: "admin" | "editor";
};

type OfficialFormState = {
  firstName: string;
  lastName: string;
  role: string;
  politicalGroup: string;
  group: "executive" | "council";
  order: string;
  status: "draft" | "published";
  photoFile: File | null;
  photoAlt: string;
  existingPhotoUrl: string | null;
  existingPhotoId: string | null;
};

const emptyFormState: OfficialFormState = {
  firstName: "",
  lastName: "",
  role: "",
  politicalGroup: "",
  group: "executive",
  order: "1",
  status: "published",
  photoFile: null,
  photoAlt: "",
  existingPhotoUrl: null,
  existingPhotoId: null
};

const cropViewport = 240;

const getPhotoMeta = (photo?: OfficialPhoto) => {
  if (!photo) {
    return { id: null, url: null, alt: null };
  }
  if (typeof photo === "string") {
    return { id: photo, url: null, alt: null };
  }

  return {
    id: photo.id ?? photo._id ?? null,
    url: photo.url ?? null,
    alt: photo.alt ?? null
  };
};

const getDisplayName = (person: Official) =>
  [person.firstName, person.lastName].filter(Boolean).join(" ");

const toOrderValue = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const uploadPhoto = async (file: File, alt: string) => {
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

const fetchOfficials = async () => {
  const response = await fetch("/api/officials?depth=1&limit=200&sort=order", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }

  const data = await response.json();
  return (data?.docs ?? []) as Official[];
};

export const OfficialsClient = ({ initialOfficials }: { initialOfficials: Official[] }) => {
  const [officials, setOfficials] = useState<Official[]>(initialOfficials);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<OfficialFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropImage, setCropImage] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
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

  const canEdit = Boolean(user);

  useEffect(() => {
    let isActive = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include"
        });
        if (!response.ok) {
          if (isActive) {
            setUser(null);
          }
          return;
        }
        const data = await response.json();
        if (isActive) {
          setUser(data?.user ?? null);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
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
        const docs = await fetchOfficials();
        if (isActive) {
          setOfficials(docs);
        }
      } catch {
        if (isActive) {
          setOfficials((prev) => prev);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    refresh();

    return () => {
      isActive = false;
    };
  }, [canEdit]);

  useEffect(() => {
    if (!formState.photoFile) {
      setPhotoPreviewUrl(formState.existingPhotoUrl);
      setCropImage(null);
      return;
    }

    const previewUrl = URL.createObjectURL(formState.photoFile);
    setPhotoPreviewUrl(previewUrl);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImage(null);

    const img = new Image();
    img.onload = () => {
      setCropImage({ url: previewUrl, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = previewUrl;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [formState.photoFile, formState.existingPhotoUrl]);

  const sortedOfficials = useMemo(() => {
    const next = [...officials];
    next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return next;
  }, [officials]);

  const executives = sortedOfficials.filter((item) => item.group === "executive");
  const councillors = sortedOfficials.filter((item) => item.group === "council");

  const openCreate = (group: "executive" | "council") => {
    const orderCandidates = sortedOfficials
      .filter((item) => item.group === group)
      .map((item) => item.order ?? 0);
    const nextOrder = orderCandidates.length > 0 ? Math.max(...orderCandidates) + 1 : 1;

    setFormState({
      ...emptyFormState,
      group,
      order: String(nextOrder)
    });
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImage(null);
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (official: Official) => {
    const photoMeta = getPhotoMeta(official.photo);
    const displayName = getDisplayName(official);

    setFormState({
      firstName: official.firstName ?? "",
      lastName: official.lastName ?? "",
      role: official.role ?? "",
      politicalGroup: official.politicalGroup ?? "",
      group: official.group ?? "executive",
      order: official.order ? String(official.order) : "0",
      status: official.status ?? "published",
      photoFile: null,
      photoAlt: photoMeta.alt ?? displayName,
      existingPhotoUrl: photoMeta.url ?? null,
      existingPhotoId: photoMeta.id ?? null
    });
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImage(null);
    setEditingId(String(official.id));
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const refreshOfficials = async () => {
    setIsLoading(true);
    try {
      const docs = await fetchOfficials();
      setOfficials(docs);
    } catch {
      setOfficials((prev) => prev);
    } finally {
      setIsLoading(false);
    }
  };

  const getCropMetrics = (zoom = cropZoom) => {
    if (!cropImage) return null;
    const baseScale = Math.max(cropViewport / cropImage.width, cropViewport / cropImage.height);
    const scale = baseScale * zoom;
    const displayWidth = cropImage.width * scale;
    const displayHeight = cropImage.height * scale;
    const maxOffsetX = Math.max(0, (displayWidth - cropViewport) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - cropViewport) / 2);
    return { baseScale, scale, displayWidth, displayHeight, maxOffsetX, maxOffsetY };
  };

  const clampOffset = (nextX: number, nextY: number, zoom = cropZoom) => {
    const metrics = getCropMetrics(zoom);
    if (!metrics) {
      return { x: nextX, y: nextY };
    }

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
    const nextOffset = clampOffset(dragState.originX + deltaX, dragState.originY + deltaY);
    setCropOffset(nextOffset);
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

    const imageLeft = (cropViewport - metrics.displayWidth) / 2 + cropOffset.x;
    const imageTop = (cropViewport - metrics.displayHeight) / 2 + cropOffset.y;
    const cropX = (0 - imageLeft) / metrics.scale;
    const cropY = (0 - imageTop) / metrics.scale;
    const cropSize = cropViewport / metrics.scale;
    const outputSize = Math.min(800, Math.round(cropSize));

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Chargement image impossible."));
      img.src = cropImage.url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, outputSize, outputSize);
    const mimeType = file.type?.startsWith("image/") ? file.type : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, 0.92);
    });

    if (!blob) return file;
    const safeName = file.name ? file.name.replace(/\s+/g, "-") : "photo.jpg";
    return new File([blob], `recadre-${safeName}`, { type: blob.type });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      let photoId = formState.existingPhotoId;
      if (formState.photoFile) {
        const fallbackAlt = `${formState.firstName} ${formState.lastName}`.trim();
        const croppedFile = await createCroppedFile(formState.photoFile);
        photoId = await uploadPhoto(croppedFile, formState.photoAlt || fallbackAlt);
      }

      const payload = {
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        role: formState.role.trim(),
        politicalGroup: formState.politicalGroup.trim() || null,
        group: formState.group,
        order: toOrderValue(formState.order),
        status: formState.status,
        ...(photoId && (editingId === null || formState.photoFile) ? { photo: photoId } : {})
      };

      const response = await fetch(
        editingId ? `/api/officials/${editingId}` : "/api/officials",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
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

      await refreshOfficials();
      setIsModalOpen(false);
      setEditingId(null);
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (officialId: string) => {
    if (!window.confirm("Supprimer cet elu ?")) {
      return;
    }

    setFormError(null);
    setDeletingId(officialId);
    try {
      const response = await fetch(`/api/officials/${officialId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }

      await refreshOfficials();
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderCard = (person: Official, sizeClass: string) => {
    const displayName = getDisplayName(person);
    const photoMeta = getPhotoMeta(person.photo);
    const photoUrl = photoMeta.url ? encodeURI(photoMeta.url) : null;
    const isDraft = person.status === "draft";

    return (
      <Card key={String(person.id)} className="p-4 flex gap-4 items-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photoMeta.alt ?? displayName}
            className={`${sizeClass} rounded-full object-cover border border-ink/10`}
            loading="lazy"
          />
        ) : (
          <div className={`${sizeClass} rounded-full bg-fog border border-ink/10`} />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{displayName}</p>
            {canEdit && isDraft ? (
              <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink/70">
                Brouillon
              </span>
            ) : null}
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate">{person.role}</p>
          {person.politicalGroup ? (
            <p className="text-xs text-slate">Liste: {person.politicalGroup}</p>
          ) : null}
        </div>
        {canEdit ? (
          <div className="ml-auto flex flex-col items-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => openEdit(person)}
              className="rounded-full border border-ink/15 px-3 py-1 font-semibold uppercase tracking-widest text-ink/70 hover:border-gold hover:text-ink"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={() => handleDelete(String(person.id))}
              disabled={deletingId === String(person.id)}
              className="rounded-full border border-red-200 px-3 py-1 font-semibold uppercase tracking-widest text-red-600 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingId === String(person.id) ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        ) : null}
      </Card>
    );
  };

  const renderSection = (
    title: string,
    group: "executive" | "council",
    items: Official[],
    sizeClass: string,
    gridClass: string
  ) => (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        {canEdit ? (
          <button
            type="button"
            onClick={() => openCreate(group)}
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold transition hover:bg-gold hover:text-ink"
          >
            <span className="text-lg leading-none">+</span>
            Ajouter
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <Card className="p-6 text-sm text-slate">
          Aucun elu publie pour cette section.
        </Card>
      ) : (
        <div className={gridClass}>{items.map((person) => renderCard(person, sizeClass))}</div>
      )}
    </section>
  );

  const cropMetrics = getCropMetrics();

  return (
    <div className="space-y-6">
      {canEdit ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-widest text-ink/70">
          <span>Mode admin actif</span>
          {isLoading ? <span className="text-ink/40">Mise a jour...</span> : null}
        </div>
      ) : null}
      {canEdit && formError && !isModalOpen ? (
        <p className="text-sm text-red-600">{formError}</p>
      ) : null}

      {renderSection(
        "Le maire et ses adjoints",
        "executive",
        executives,
        "h-16 w-16",
        "grid gap-4 md:grid-cols-2"
      )}
      {renderSection(
        "Conseillers municipaux",
        "council",
        councillors,
        "h-14 w-14",
        "grid gap-4 md:grid-cols-3"
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={closeModal}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  {editingId ? "Modifier un elu" : "Nouvel elu"}
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Edition de la fiche" : "Ajouter un elu"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSave}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-ink/80">
                  Prenom
                  <input
                    type="text"
                    value={formState.firstName}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Nom
                  <input
                    type="text"
                    value={formState.lastName}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-ink/80">
                  Fonction
                  <input
                    type="text"
                    value={formState.role}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, role: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Liste
                  <input
                    type="text"
                    value={formState.politicalGroup}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, politicalGroup: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Section
                  <select
                    value={formState.group}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        group: event.target.value as "executive" | "council"
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <option value="executive">Le maire et ses adjoints</option>
                    <option value="council">Conseillers municipaux</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Statut
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: event.target.value as "draft" | "published"
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <option value="published">Publie</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Ordre
                  <input
                    type="number"
                    value={formState.order}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, order: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    min={0}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div className="space-y-3">
                  <div
                    className="relative h-60 w-60 overflow-hidden rounded-3xl border border-ink/10 bg-fog/60 touch-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  >
                    {cropImage ? (
                      <div
                        className="absolute left-1/2 top-1/2"
                        style={{
                          transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px)`
                        }}
                      >
                        <img
                          src={cropImage.url}
                          alt={formState.photoAlt || "Photo elu"}
                          className="block max-w-none select-none"
                          draggable={false}
                          style={{
                            width: cropImage.width,
                            height: cropImage.height,
                            transform: `scale(${cropMetrics?.scale ?? 1})`,
                            transformOrigin: "center"
                          }}
                        />
                      </div>
                    ) : photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt={formState.photoAlt || "Photo elu"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-3xl bg-fog border border-ink/10" />
                    )}
                  </div>
                  {cropImage ? (
                    <div className="space-y-2 text-xs text-ink/60">
                      <div className="flex items-center justify-between">
                        <span>Zoom</span>
                        <span>{cropZoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={cropZoom}
                        onChange={(event) => {
                          const nextZoom = Number(event.target.value);
                          setCropZoom(nextZoom);
                          setCropOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
                        }}
                        className="w-full accent-ink"
                      />
                      <button
                        type="button"
                        onClick={() => setCropOffset({ x: 0, y: 0 })}
                        className="text-xs font-semibold uppercase tracking-widest text-ink/70 hover:text-ink"
                      >
                        Recentrer
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-ink/80">
                    Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          photoFile: event.target.files?.[0] ?? null
                        }))
                      }
                      className="mt-2 w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white hover:file:bg-ink/90"
                    />
                  </label>
                  {cropImage ? (
                    <p className="text-xs text-ink/60">
                      Glissez la photo pour recadrer, puis ajustez le zoom.
                    </p>
                  ) : null}
                  <label className="text-sm font-semibold text-ink/80">
                    Texte alternatif
                    <input
                      type="text"
                      value={formState.photoAlt}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, photoAlt: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </label>
                </div>
              </div>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/60 hover:border-ink/30 hover:text-ink"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-ink px-6 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
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
