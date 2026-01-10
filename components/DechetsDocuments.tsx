"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FileText } from "@phosphor-icons/react";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

export type DechetsDocumentItem = {
  id: string | number;
  title: string;
  documentDate?: string | null;
  year?: number | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  createdAt?: string | null;
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type DocumentFormState = {
  title: string;
  documentDate: string;
  year: string;
  file: File | null;
  existingFileName: string | null;
};

const DOCUMENT_TYPE = "dechets";

const emptyFormState: DocumentFormState = {
  title: "",
  documentDate: "",
  year: "",
  file: null,
  existingFileName: null
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

const deriveYear = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const buildFileName = (
  title: string,
  documentDate: string,
  originalName: string,
  existingNames: Set<string>
) => {
  const extension = originalName.split(".").pop() || "pdf";
  const year = deriveYear(documentDate) || "document";
  const base = [year, "dechets", title]
    .filter(Boolean)
    .map((part) => slugify(String(part)))
    .filter(Boolean)
    .join("_");
  let candidate = `${base}.${extension}`;
  let counter = 2;
  while (existingNames.has(candidate)) {
    candidate = `${base}-${counter}.${extension}`;
    counter += 1;
  }
  return candidate;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const buildDocumentsUrl = (limit = 50) => {
  const params = new URLSearchParams({
    depth: "0",
    limit: String(limit),
    sort: "-documentDate",
    "where[documentType][equals]": DOCUMENT_TYPE
  });
  return `/api/documents?${params.toString()}`;
};

const fetchDocuments = async () => {
  const response = await fetch(buildDocumentsUrl(), { credentials: "include" });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return (data?.docs ?? []) as DechetsDocumentItem[];
};

export const DechetsDocuments = ({
  initialDocuments
}: {
  initialDocuments: DechetsDocumentItem[];
}) => {
  const [documents, setDocuments] = useState<DechetsDocumentItem[]>(initialDocuments);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<DocumentFormState>(emptyFormState);
  const [activeDoc, setActiveDoc] = useState<DechetsDocumentItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const canEdit = hasPermission(user, "manageDocuments");

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      const dateA = new Date(a.documentDate ?? "").getTime();
      const dateB = new Date(b.documentDate ?? "").getTime();
      return dateB - dateA;
    });
  }, [documents]);

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!activeDoc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDoc(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeDoc]);

  const isImageDoc = (doc: DechetsDocumentItem) => {
    if (doc.mimeType?.startsWith("image/")) return true;
    const name = `${doc.filename ?? ""} ${doc.url ?? ""}`.toLowerCase();
    return /\.(png|jpe?g|webp|gif|svg)$/.test(name);
  };

  const isPdfDoc = (doc: DechetsDocumentItem) => {
    if (doc.mimeType === "application/pdf") return true;
    const name = `${doc.filename ?? ""} ${doc.url ?? ""}`.toLowerCase();
    return name.includes(".pdf");
  };

  useEffect(() => {
    if (!canEdit) return;
    let isActive = true;
    const refresh = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchDocuments();
        if (isActive) setDocuments(docs);
      } catch {
        if (isActive) setDocuments((prev) => prev);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    refresh();

    return () => {
      isActive = false;
    };
  }, [canEdit]);

  const openCreate = () => {
    const today = new Date();
    setEditingId(null);
    setFormState({
      ...emptyFormState,
      documentDate: toDateInputValue(today.toISOString()),
      year: String(today.getFullYear())
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (doc: DechetsDocumentItem) => {
    setEditingId(doc.id);
    setFormState({
      title: doc.title ?? "",
      documentDate: toDateInputValue(doc.documentDate),
      year: String(doc.year ?? deriveYear(doc.documentDate) ?? ""),
      file: null,
      existingFileName: doc.filename ?? null
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setFormState(emptyFormState);
    setEditingId(null);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const title = formState.title.trim();
      if (!title) {
        setFormError("Le titre est obligatoire.");
        setIsSaving(false);
        return;
      }
      if (!formState.documentDate) {
        setFormError("La date du document est obligatoire.");
        setIsSaving(false);
        return;
      }
      const documentDate = toISODate(formState.documentDate);
      if (!documentDate) {
        setFormError("La date du document est invalide.");
        setIsSaving(false);
        return;
      }
      if (!editingId && !formState.file) {
        setFormError("Le fichier est obligatoire.");
        setIsSaving(false);
        return;
      }

      const payload = {
        title,
        documentType: DOCUMENT_TYPE,
        documentDate,
        year: formState.year ? Number(formState.year) : undefined
      };

      if (formState.file) {
        const existingNames = new Set(
          documents.map((doc) => doc.filename ?? "").filter(Boolean)
        );
        const renamed = buildFileName(
          title,
          formState.documentDate,
          formState.file.name,
          existingNames
        );
        const renamedFile = new File([formState.file], renamed, {
          type: formState.file.type
        });
        const formData = new FormData();
        formData.append("file", renamedFile);
        formData.append("_payload", JSON.stringify(payload));

        const url = editingId ? `/api/documents/${editingId}` : "/api/documents";
        const response = await fetch(url, {
          method: editingId ? "PATCH" : "POST",
          credentials: "include",
          body: formData
        });
        if (!response.ok) {
          throw new Error("Enregistrement impossible.");
        }
      } else if (editingId) {
        const response = await fetch(`/api/documents/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error("Enregistrement impossible.");
        }
      }

      const docs = await fetchDocuments();
      setDocuments(docs);
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (doc: DechetsDocumentItem) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch {
      setFormError("Suppression impossible.");
    }
  };

  if (!canEdit && sortedDocuments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            <span>Mode admin actif</span>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
            >
              Ajouter un document
            </button>
          </div>
          {isLoading ? <p className="text-xs text-slate">Chargement...</p> : null}
          {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
        </div>
      ) : null}

      {sortedDocuments.length > 0 ? (
        <div className="grid gap-3">
          {sortedDocuments.map((doc) => {
            const dateLabel = formatDate(doc.documentDate);
            if (canEdit) {
              return (
                <div
                  key={String(doc.id)}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm"
                >
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate">{dateLabel}</p>
                    <p className="font-semibold text-ink">{doc.title}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70">
                    <button
                      type="button"
                      onClick={() => doc.url && setActiveDoc(doc)}
                      className="rounded-full border border-ink/10 px-3 py-2"
                      disabled={!doc.url}
                    >
                      Voir
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(doc)}
                      className="rounded-full border border-ink/10 px-3 py-2"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc)}
                      className="rounded-full border border-ink/10 px-3 py-2 text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={String(doc.id)}
                type="button"
                onClick={() => doc.url && setActiveDoc(doc)}
                className="flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left text-sm font-semibold text-ink/80 hover:bg-goldSoft/50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!doc.url}
              >
                <span>
                  {doc.title}
                  <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">
                    {dateLabel}
                  </span>
                </span>
                <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : null}

      {activeDoc?.url && isMounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activeDoc.title}
              className="fixed inset-0 z-[2147483647] bg-ink/70 backdrop-blur-sm"
              onClick={() => setActiveDoc(null)}
            >
              <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
                <div
                  className="relative flex items-center justify-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDoc(null)}
                    className="absolute right-3 top-3 z-[2147483648] rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card"
                  >
                    Fermer
                  </button>
                  {isImageDoc(activeDoc) ? (
                    <img
                      src={activeDoc.url}
                      alt={activeDoc.title}
                      className="max-h-[85vh] w-auto max-w-[90vw] object-contain block"
                    />
                  ) : isPdfDoc(activeDoc) ? (
                    <div className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)]">
                      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                        <p className="text-sm font-semibold text-ink">{activeDoc.title}</p>
                      </div>
                      <iframe
                        title={activeDoc.title}
                        src={`${activeDoc.url}#view=FitH`}
                        className="h-full w-full"
                      />
                      <div className="flex items-center justify-end gap-3 border-t border-ink/10 px-4 py-3">
                        <a
                          href={activeDoc.url}
                          download
                          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
                        >
                          Telecharger
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white px-6 py-5 text-sm text-ink shadow-card">
                      <p className="font-semibold">{activeDoc.title}</p>
                      <p className="mt-2 text-slate">
                        Apercu indisponible pour ce format.
                      </p>
                      <a
                        href={activeDoc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"
                      >
                        Ouvrir le fichier
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

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
                  Documents utiles
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Modifier le document" : "Ajouter un document"}
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

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
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

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-ink/80">
                  Date du document
                  <input
                    type="date"
                    value={formState.documentDate}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        documentDate: event.target.value,
                        year: prev.year || deriveYear(event.target.value)
                      }))
                    }
                    className="mt-2 w-full glass-input"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-ink/80">
                  Annee
                  <input
                    type="number"
                    value={formState.year}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, year: event.target.value }))
                    }
                    className="mt-2 w-full glass-input"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-ink/80">
                Fichier
                <input
                  type="file"
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      file: event.target.files?.[0] ?? null
                    }))
                  }
                  className="mt-2 w-full text-sm"
                />
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
