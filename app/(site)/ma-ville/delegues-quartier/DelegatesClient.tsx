"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { Card } from "@/components/Card";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type DelegateStreet = { name?: string } | string;

type SectorStreet = { name?: string } | string;

type Sector = {
  id: string | number;
  number: number;
  streets?: SectorStreet[] | null;
  status?: "draft" | "published";
};

type DelegatePhoto =
  | {
      id?: string;
      _id?: string;
      url?: string;
      alt?: string;
    }
  | string
  | null;

type Delegate = {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  sectorRef?: Sector | string | null;
  sector?: number | null;
  streets?: DelegateStreet[] | null;
  status?: "draft" | "published";
  photo?: DelegatePhoto;
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type DelegateFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sectorId: string;
  status: "draft" | "published";
  photoFile: File | null;
  photoAlt: string;
  existingPhotoUrl: string | null;
  existingPhotoId: string | null;
};

type SectorFormState = {
  number: string;
  status: "draft" | "published";
  streets: string;
};

const emptyFormState: DelegateFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  sectorId: "",
  status: "published",
  photoFile: null,
  photoAlt: "",
  existingPhotoUrl: null,
  existingPhotoId: null
};

const emptySectorFormState: SectorFormState = {
  number: "1",
  status: "published",
  streets: ""
};

const cropViewport = 240;

const getPhotoMeta = (photo?: DelegatePhoto) => {
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

const getSectorId = (sectorRef?: Sector | string | null) => {
  if (!sectorRef) return null;
  if (typeof sectorRef === "string" || typeof sectorRef === "number") {
    return String(sectorRef);
  }
  const id = sectorRef.id ?? (sectorRef as { _id?: string | number })._id;
  return id ? String(id) : null;
};

const normalizeSectorRef = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
};

const getDisplayName = (person: Delegate) =>
  [person.firstName, person.lastName].filter(Boolean).join(" ");

const toStreetText = (streets?: SectorStreet[] | null) => {
  if (!streets || streets.length === 0) return "";
  return streets
    .map((street) => (typeof street === "string" ? street : street.name ?? ""))
    .filter((value) => value.trim().length > 0)
    .join("\n");
};

const toStreetPayload = (streetsText: string) => {
  const lines = streetsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.map((name) => ({ name }));
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

const fetchDelegates = async () => {
  const response = await fetch("/api/delegates?depth=1&limit=200&sort=lastName", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }

  const data = await response.json();
  return (data?.docs ?? []) as Delegate[];
};

const fetchSectors = async () => {
  const response = await fetch("/api/sectors?depth=1&limit=200&sort=number", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }

  const data = await response.json();
  return (data?.docs ?? []) as Sector[];
};

export const DelegatesClient = ({
  initialDelegates,
  initialSectors
}: {
  initialDelegates: Delegate[];
  initialSectors: Sector[];
}) => {
  const [delegates, setDelegates] = useState<Delegate[]>(initialDelegates);
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DelegateFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sectorError, setSectorError] = useState<string | null>(null);
  const [sectorFormError, setSectorFormError] = useState<string | null>(null);
  const [sectorFormState, setSectorFormState] = useState<SectorFormState>(
    emptySectorFormState
  );
  const [sectorEditingId, setSectorEditingId] = useState<string | null>(null);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropImage, setCropImage] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [hasAttemptedMigration, setHasAttemptedMigration] = useState(false);
  const [migrationState, setMigrationState] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
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

  const canEdit =
    hasPermission(user, "manageDelegates") || hasPermission(user, "manageSectors");

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
        const [delegateDocs, sectorDocs] = await Promise.all([fetchDelegates(), fetchSectors()]);
        if (isActive) {
          setDelegates(delegateDocs);
          setSectors(sectorDocs);
        }
      } catch {
        if (isActive) {
          setDelegates((prev) => prev);
          setSectors((prev) => prev);
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

  const sortedSectors = useMemo(() => {
    const next = [...sectors];
    next.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    return next;
  }, [sectors]);

  const delegatesBySector = useMemo(() => {
    const map = new Map<string, Delegate[]>();
    const unassigned: Delegate[] = [];
    delegates.forEach((delegate) => {
      const sectorId = getSectorId(delegate.sectorRef);
      if (!sectorId) {
        unassigned.push(delegate);
        return;
      }
      if (!map.has(sectorId)) {
        map.set(sectorId, []);
      }
      map.get(sectorId)?.push(delegate);
    });
    return { map, unassigned };
  }, [delegates]);

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      const [delegateDocs, sectorDocs] = await Promise.all([fetchDelegates(), fetchSectors()]);
      setDelegates(delegateDocs);
      setSectors(sectorDocs);
    } catch {
      setDelegates((prev) => prev);
      setSectors((prev) => prev);
    } finally {
      setIsLoading(false);
    }
  };

  const openDelegateCreate = (sectorId?: string | null) => {
    setSectorError(null);
    if (sortedSectors.length === 0) {
      setSectorError("Creez un secteur avant d'ajouter un delegue.");
      return;
    }

    setFormState({
      ...emptyFormState,
      sectorId: sectorId ?? getSectorId(sortedSectors[0]) ?? ""
    });
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDelegateEdit = (delegate: Delegate) => {
    const photoMeta = getPhotoMeta(delegate.photo);
    const displayName = getDisplayName(delegate);

    setFormState({
      firstName: delegate.firstName ?? "",
      lastName: delegate.lastName ?? "",
      email: delegate.email ?? "",
      phone: delegate.phone ?? "",
      sectorId: getSectorId(delegate.sectorRef) ?? "",
      status: delegate.status ?? "published",
      photoFile: null,
      photoAlt: photoMeta.alt ?? displayName,
      existingPhotoUrl: photoMeta.url ?? null,
      existingPhotoId: photoMeta.id ?? null
    });
    setEditingId(String(delegate.id));
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const openSectorCreate = () => {
    setSectorFormState(emptySectorFormState);
    setSectorEditingId(null);
    setSectorFormError(null);
    setIsSectorModalOpen(true);
  };

  const openSectorEdit = (sector: Sector) => {
    setSectorFormState({
      number: sector.number ? String(sector.number) : "1",
      status: sector.status ?? "published",
      streets: toStreetText(sector.streets)
    });
    setSectorEditingId(String(sector.id));
    setSectorFormError(null);
    setIsSectorModalOpen(true);
  };

  const closeSectorModal = () => {
    setIsSectorModalOpen(false);
    setSectorEditingId(null);
    setSectorFormError(null);
  };

  const getCropMetrics = (zoom = cropZoom) => {
    if (!cropImage) return null;
    const baseScale = Math.max(cropViewport / cropImage.width, cropViewport / cropImage.height);
    const scale = baseScale * zoom;
    const displayWidth = cropImage.width * scale;
    const displayHeight = cropImage.height * scale;
    const maxOffsetX = Math.max(0, (displayWidth - cropViewport) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - cropViewport) / 2);
    return { scale, displayWidth, displayHeight, maxOffsetX, maxOffsetY };
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

  const runLegacyMigration = async () => {
    setMigrationState("running");
    setSectorError(null);

    try {
      const sectorByNumber = new Map<number, Sector>();
      sectors.forEach((sector) => {
        if (typeof sector.number === "number") {
          sectorByNumber.set(sector.number, sector);
        }
      });

      const legacyDelegates = delegates.filter(
        (delegate) =>
          !getSectorId(delegate.sectorRef) &&
          (typeof delegate.sector === "number" || (delegate.streets?.length ?? 0) > 0)
      );

      if (legacyDelegates.length === 0) {
        setMigrationState("done");
        setHasAttemptedMigration(true);
        return;
      }

      const streetsByNumber = new Map<number, Set<string>>();
      legacyDelegates.forEach((delegate) => {
        if (typeof delegate.sector !== "number") return;
        const streetSet = streetsByNumber.get(delegate.sector) ?? new Set<string>();
        const legacyStreetNames = toStreetText(delegate.streets)
          .split(/\r?\n/)
          .map((name) => name.trim())
          .filter(Boolean);
        legacyStreetNames.forEach((name) => streetSet.add(name));
        streetsByNumber.set(delegate.sector, streetSet);
      });

      for (const [sectorNumber, streetSet] of streetsByNumber.entries()) {
        const existing = sectorByNumber.get(sectorNumber);
        const streetsPayload = Array.from(streetSet).map((name) => ({ name }));

        if (!existing) {
          const response = await fetch("/api/sectors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              number: sectorNumber,
              status: "published",
              streets: streetsPayload
            })
          });

          if (response.ok) {
            const data = await response.json();
            const created = data?.doc ?? data;
            if (created?.id) {
              sectorByNumber.set(sectorNumber, created as Sector);
            }
          }
        } else if (streetsPayload.length > 0) {
          const existingStreets = new Set(
            toStreetText(existing.streets)
              .split(/\r?\n/)
              .map((name) => name.trim())
              .filter(Boolean)
          );
          let hasUpdates = false;
          streetsPayload.forEach((street) => {
            if (!existingStreets.has(street.name)) {
              existingStreets.add(street.name);
              hasUpdates = true;
            }
          });
          if (hasUpdates) {
            await fetch(`/api/sectors/${existing.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
                streets: Array.from(existingStreets).map((name) => ({ name }))
              })
            });
          }
        }
      }

      for (const delegate of legacyDelegates) {
        if (typeof delegate.sector !== "number") continue;
        const sector = sectorByNumber.get(delegate.sector);
        if (!sector) continue;

        await fetch(`/api/delegates/${delegate.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ sectorRef: sector.id })
        });
      }

      await refreshAll();
      setMigrationState("done");
      setHasAttemptedMigration(true);
    } catch {
      setMigrationState("error");
      setSectorError("Migration automatique impossible.");
      setHasAttemptedMigration(true);
    }
  };

  useEffect(() => {
    if (!canEdit || hasAttemptedMigration || isLoading) return;

    const needsMigration = delegates.some(
      (delegate) =>
        !getSectorId(delegate.sectorRef) &&
        (typeof delegate.sector === "number" || (delegate.streets?.length ?? 0) > 0)
    );

    if (!needsMigration) {
      setHasAttemptedMigration(true);
      return;
    }

    runLegacyMigration();
  }, [canEdit, delegates, hasAttemptedMigration, isLoading]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    if (!formState.sectorId.trim()) {
      setFormError("Choisissez un secteur avant d'enregistrer.");
      setIsSaving(false);
      return;
    }

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
        email: formState.email.trim() || null,
        phone: formState.phone.trim() || null,
        sectorRef: normalizeSectorRef(formState.sectorId),
        status: formState.status,
        ...(photoId && (editingId === null || formState.photoFile) ? { photo: photoId } : {})
      };

      const response = await fetch(
        editingId ? `/api/delegates/${editingId}` : "/api/delegates",
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

      await refreshAll();
      setIsModalOpen(false);
      setEditingId(null);
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectorSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSectorFormError(null);

    const sectorNumber = Number(sectorFormState.number);
    if (Number.isNaN(sectorNumber) || sectorNumber <= 0) {
      setSectorFormError("Numero de secteur invalide.");
      return;
    }

    try {
      const payload = {
        number: sectorNumber,
        status: sectorFormState.status,
        streets: toStreetPayload(sectorFormState.streets)
      };

      const response = await fetch(
        sectorEditingId ? `/api/sectors/${sectorEditingId}` : "/api/sectors",
        {
          method: sectorEditingId ? "PATCH" : "POST",
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
        setSectorFormError(message);
        return;
      }

      await refreshAll();
      setIsSectorModalOpen(false);
      setSectorEditingId(null);
    } catch {
      setSectorFormError("Enregistrement impossible.");
    }
  };

  const handleDelete = async (delegateId: string) => {
    if (!window.confirm("Supprimer ce delegue ?")) {
      return;
    }

    setFormError(null);
    setDeletingId(delegateId);
    try {
      const response = await fetch(`/api/delegates/${delegateId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }

      await refreshAll();
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSectorDelete = async (sectorId: string) => {
    const hasDelegates = delegates.some(
      (delegate) => getSectorId(delegate.sectorRef) === sectorId
    );
    if (hasDelegates) {
      setSectorError("Supprimez ou deplacez les delegues avant ce secteur.");
      return;
    }

    if (!window.confirm("Supprimer ce secteur ?")) {
      return;
    }

    setSectorError(null);
    try {
      const response = await fetch(`/api/sectors/${sectorId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }

      await refreshAll();
    } catch {
      setSectorError("Suppression impossible.");
    }
  };

  const cropMetrics = getCropMetrics();

  return (
    <div className="space-y-6">
      {canEdit ? (
        <div className="flex flex-wrap items-center gap-3 glass-panel px-4 py-3 text-xs font-semibold uppercase tracking-widest text-ink/70">
          <span>Mode admin actif</span>
          {isLoading ? <span className="text-ink/40">Mise a jour...</span> : null}
          {migrationState === "running" ? (
            <span className="text-ink/40">Migration en cours...</span>
          ) : null}
          <button
            type="button"
            onClick={openSectorCreate}
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold transition hover:bg-gold hover:text-ink"
          >
            <span className="text-base leading-none">+</span>
            Ajouter un secteur
          </button>
        </div>
      ) : null}
      {canEdit && sectorError ? <p className="text-sm text-red-600">{sectorError}</p> : null}
      {canEdit && formError && !isModalOpen ? (
        <p className="text-sm text-red-600">{formError}</p>
      ) : null}

      {sortedSectors.length === 0 ? (
        <Card className="p-6 text-sm text-slate">
          Aucun secteur publie pour le moment.
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedSectors.map((sector) => {
            const sectorId = getSectorId(sector) ?? String(sector.id);
            const sectorDelegates = [...(delegatesBySector.map.get(sectorId) ?? [])].sort(
              (a, b) => a.lastName.localeCompare(b.lastName)
            );
            const streetNames = toStreetText(sector.streets)
              .split(/\r?\n/)
              .map((name) => name.trim())
              .filter(Boolean);

            return (
              <section key={sectorId} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="section-title motion-in">Secteur {sector.number}</h2>
                  {canEdit ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDelegateCreate(sectorId)}
                        className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-gold hover:text-ink"
                      >
                        <span className="text-lg leading-none">+</span>
                        Ajouter un delegue
                      </button>
                      <button
                        type="button"
                        onClick={() => openSectorEdit(sector)}
                        className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-gold hover:text-ink"
                      >
                        Modifier secteur
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSectorDelete(sectorId)}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-600 hover:border-red-400"
                      >
                        Supprimer secteur
                      </button>
                    </div>
                  ) : null}
                </div>

                {streetNames.length > 0 ? (
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink/60">
                      Rues rattachees
                    </p>
                    <ul className="mt-3 grid gap-2 text-xs text-ink/70 sm:grid-cols-2">
                      {streetNames.map((street) => (
                        <li key={street} className="rounded-lg bg-fog/70 px-3 py-1">
                          {street}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : (
                  <Card className="p-4 text-xs text-slate">Aucune rue renseignee.</Card>
                )}

                {sectorDelegates.length === 0 ? (
                  <Card className="p-6 text-sm text-slate">
                    Aucun delegue publie pour ce secteur.
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {sectorDelegates.map((person) => {
                      const displayName = getDisplayName(person);
                      const photoMeta = getPhotoMeta(person.photo);
                      const photoUrl = photoMeta.url ? encodeURI(photoMeta.url) : null;

                      return (
                        <Card key={String(person.id)} className="p-5 space-y-4">
                          <div className="flex gap-4 items-center">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={photoMeta.alt ?? displayName}
                                className="h-16 w-16 rounded-full object-cover border border-ink/10"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-fog border border-ink/10" />
                            )}
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-ink">{displayName}</p>
                              {person.email ? (
                                <a
                                  href={`mailto:${person.email}`}
                                  className="text-xs text-slate hover:text-ink"
                                >
                                  {person.email}
                                </a>
                              ) : null}
                              {person.phone ? (
                                <p className="text-xs text-slate">Tel: {person.phone}</p>
                              ) : null}
                            </div>
                            {canEdit ? (
                              <div className="ml-auto flex flex-col items-end gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => openDelegateEdit(person)}
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
                                  {deletingId === String(person.id)
                                    ? "Suppression..."
                                    : "Supprimer"}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          {canEdit && delegatesBySector.unassigned.length > 0 ? (
            <section className="space-y-4">
              <h2 className="section-title motion-in">Delegues sans secteur</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[...delegatesBySector.unassigned]
                  .sort((a, b) => a.lastName.localeCompare(b.lastName))
                  .map((person) => {
                  const displayName = getDisplayName(person);
                  const photoMeta = getPhotoMeta(person.photo);
                  const photoUrl = photoMeta.url ? encodeURI(photoMeta.url) : null;

                  return (
                    <Card key={String(person.id)} className="p-5 space-y-4">
                      <div className="flex gap-4 items-center">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={photoMeta.alt ?? displayName}
                            className="h-16 w-16 rounded-full object-cover border border-ink/10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-fog border border-ink/10" />
                        )}
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-ink">{displayName}</p>
                          {person.email ? (
                            <a
                              href={`mailto:${person.email}`}
                              className="text-xs text-slate hover:text-ink"
                            >
                              {person.email}
                            </a>
                          ) : null}
                        </div>
                        <div className="ml-auto flex flex-col items-end gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => openDelegateEdit(person)}
                            className="rounded-full border border-ink/15 px-3 py-1 font-semibold uppercase tracking-widest text-ink/70 hover:border-gold hover:text-ink"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={closeModal}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  {editingId ? "Modifier un delegue" : "Nouveau delegue"}
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Edition de la fiche" : "Ajouter un delegue"}
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
                    className="mt-2 w-full glass-input"
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
                    className="mt-2 w-full glass-input"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Email
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Telephone
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Secteur
                  <select
                    value={formState.sectorId}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, sectorId: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                    required
                  >
                    <option value="">Choisir un secteur</option>
                    {sortedSectors.map((sector) => {
                      const sectorId = getSectorId(sector) ?? String(sector.id);
                      return (
                        <option key={sectorId} value={sectorId}>
                          Secteur {sector.number}
                        </option>
                      );
                    })}
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
                    className="mt-2 w-full glass-input"
                  >
                    <option value="published">Publie</option>
                    <option value="draft">Brouillon</option>
                  </select>
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
                          alt={formState.photoAlt || "Photo delegue"}
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
                        alt={formState.photoAlt || "Photo delegue"}
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
                      className="mt-2 w-full glass-input"
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

      {isSectorModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={closeSectorModal}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  {sectorEditingId ? "Modifier un secteur" : "Nouveau secteur"}
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {sectorEditingId ? "Edition du secteur" : "Ajouter un secteur"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSectorModal}
                className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSectorSave}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-ink/80">
                  Numero de secteur
                  <input
                    type="number"
                    min={1}
                    value={sectorFormState.number}
                    onChange={(event) =>
                      setSectorFormState((prev) => ({ ...prev, number: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Statut
                  <select
                    value={sectorFormState.status}
                    onChange={(event) =>
                      setSectorFormState((prev) => ({
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
                <label className="md:col-span-2 text-sm font-semibold text-ink/80">
                  Rues du secteur (une par ligne)
                  <textarea
                    value={sectorFormState.streets}
                    onChange={(event) =>
                      setSectorFormState((prev) => ({ ...prev, streets: event.target.value }))
                    }
                    rows={6}
                    className="mt-2 w-full glass-input"
                  />
                </label>
              </div>

              {sectorFormError ? (
                <p className="text-sm text-red-600">{sectorFormError}</p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeSectorModal}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/60 hover:border-ink/30 hover:text-ink"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ink px-6 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-ink/90"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
