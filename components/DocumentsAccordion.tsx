"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { SearchInput } from "@/components/SearchInput";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type DocumentItem = {
  id: string | number;
  title: string;
  documentType?: string | null;
  documentDate?: string | null;
  year?: number | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  createdAt?: string | null;
  filesize?: number | null;
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type DocumentFormState = {
  title: string;
  documentType: string;
  documentDate: string;
  year: string;
  file: File | null;
  existingFileName: string | null;
};

const documentTypes = [
  { label: "DOB", value: "dob" },
  { label: "BP", value: "bp" },
  { label: "CA", value: "ca" },
  { label: "Deliberation", value: "deliberation" },
  { label: "Rapport", value: "rapport" },
  { label: "Annexe", value: "annexe" },
  { label: "Dechets", value: "dechets" },
  { label: "Vendinfos", value: "vendinfos" },
  { label: "Autre", value: "autre" }
];

const typeLabel = (value?: string | null) =>
  documentTypes.find((item) => item.value === value)?.label ?? "Autre";

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
  documentType: string,
  documentDate: string,
  originalName: string,
  existingNames: Set<string>
) => {
  const extension = originalName.split(".").pop() || "pdf";
  const year = deriveYear(documentDate) || "document";
  const base = [year, documentType || "document", title]
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

const isPdf = (doc: DocumentItem) => {
  if (doc.mimeType === "application/pdf") return true;
  if (doc.filename) {
    return doc.filename.toLowerCase().endsWith(".pdf");
  }
  return false;
};

const filterByType = (items: DocumentItem[], documentType?: string) => {
  if (!documentType) return items;
  return items.filter((doc) => doc.documentType === documentType);
};

const buildDocumentsUrl = (documentType?: string, limit = 200) => {
  const params = new URLSearchParams({
    depth: "0",
    limit: String(limit),
    sort: "-documentDate"
  });
  if (documentType) {
    params.set("where[documentType][equals]", documentType);
  }
  return `/api/documents?${params.toString()}`;
};

const fetchDocuments = async (options?: { documentType?: string; limit?: number }) => {
  const response = await fetch(buildDocumentsUrl(options?.documentType, options?.limit), {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }
  const data = await response.json();
  return filterByType((data?.docs ?? []) as DocumentItem[], options?.documentType);
};

const uploadWithProgress = (
  method: "POST" | "PATCH",
  url: string,
  formData: FormData,
  onProgress: (value: number) => void
) =>
  new Promise<DocumentItem>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const value = Math.round((event.loaded / event.total) * 100);
      onProgress(value);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve((data?.doc ?? data) as DocumentItem);
        } catch {
          reject(new Error("Reponse invalide."));
        }
      } else {
        reject(new Error("Enregistrement impossible."));
      }
    };
    xhr.onerror = () => reject(new Error("Enregistrement impossible."));
    xhr.send(formData);
  });

const emptyFormState: DocumentFormState = {
  title: "",
  documentType: "autre",
  documentDate: "",
  year: "",
  file: null,
  existingFileName: null
};

export const DocumentsAccordion = ({
  initialDocuments,
  viewerBasePath = "/ma-ville/fiscalite/documents",
  documentTypeFilter,
  forcedDocumentType,
  showPublicYearFilter = false
}: {
  initialDocuments: DocumentItem[];
  viewerBasePath?: string;
  documentTypeFilter?: string;
  forcedDocumentType?: string;
  showPublicYearFilter?: boolean;
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(
    filterByType(initialDocuments, documentTypeFilter)
  );
  const [openYears, setOpenYears] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<DocumentFormState>({
    ...emptyFormState,
    documentType: forcedDocumentType ?? emptyFormState.documentType
  });
  const [yearTouched, setYearTouched] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const [adminYearFilter, setAdminYearFilter] = useState("Toutes");
  const [publicYearFilter, setPublicYearFilter] = useState("Toutes");
  const didInitOpenYears = useRef(false);

  const requiredPermission =
    documentTypeFilter === "vendinfos" ? "manageVendinfos" : "manageDocuments";
  const canEdit = hasPermission(user, requiredPermission);

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
    if (documents.length === 0 || didInitOpenYears.current) return;
    const years = Array.from(
      new Set(
        documents.map((doc) => String(doc.year ?? deriveYear(doc.documentDate) ?? "")).filter(Boolean)
      )
    ).sort((a, b) => Number(b) - Number(a));
    if (years.length > 0) {
      setOpenYears(new Set([years[0]]));
      didInitOpenYears.current = true;
    }
  }, [documents]);

  useEffect(() => {
    if (!canEdit) return;
    let isActive = true;
    const refresh = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchDocuments({ documentType: documentTypeFilter, limit: 200 });
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

const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      const dateA = (() => {
        const parsed = new Date(a.documentDate ?? "");
        const time = parsed.getTime();
        return Number.isNaN(time) ? 0 : time;
      })();
      const dateB = (() => {
        const parsed = new Date(b.documentDate ?? "");
        const time = parsed.getTime();
        return Number.isNaN(time) ? 0 : time;
      })();
      if (dateA !== dateB) return dateB - dateA;
      return (a.title ?? "").localeCompare(b.title ?? "");
    });
  }, [documents]);

  const years = useMemo(() => {
    const set = new Set(
      sortedDocuments.map((doc) => String(doc.year ?? deriveYear(doc.documentDate) ?? "")).filter(Boolean)
    );
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [sortedDocuments]);

  const groupedDocuments = useMemo(() => {
    const map = new Map<string, DocumentItem[]>();
    years.forEach((year) => map.set(year, []));
    sortedDocuments.forEach((doc) => {
      const year = String(doc.year ?? deriveYear(doc.documentDate) ?? "");
      if (!year) return;
      if (!map.has(year)) map.set(year, []);
      map.get(year)?.push(doc);
    });
    return map;
  }, [sortedDocuments, years]);

  const adminYears = useMemo(() => ["Toutes", ...years], [years]);
  const publicYears = useMemo(() => ["Toutes", ...years], [years]);

  const visibleYears = useMemo(() => {
    if (!showPublicYearFilter || publicYearFilter === "Toutes") return years;
    return years.filter((year) => year === publicYearFilter);
  }, [years, showPublicYearFilter, publicYearFilter]);

  const adminResults = useMemo(() => {
    let items = sortedDocuments;
    if (adminYearFilter !== "Toutes") {
      items = items.filter(
        (doc) => String(doc.year ?? deriveYear(doc.documentDate)) === adminYearFilter
      );
    }
    if (!adminQuery) return items;
    const query = adminQuery.toLowerCase();
    return items.filter((doc) => doc.title?.toLowerCase().includes(query));
  }, [sortedDocuments, adminQuery, adminYearFilter]);

  useEffect(() => {
    if (!showPublicYearFilter) return;
    if (publicYearFilter === "Toutes") return;
    setOpenYears(new Set([publicYearFilter]));
  }, [publicYearFilter, showPublicYearFilter]);

  const toggleYear = (year: string) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setFormState({
      ...emptyFormState,
      documentType: forcedDocumentType ?? emptyFormState.documentType
    });
    setYearTouched(false);
    setFormError(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEdit = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setFormState({
      title: doc.title ?? "",
      documentType: forcedDocumentType ?? doc.documentType ?? "autre",
      documentDate: toDateInputValue(doc.documentDate),
      year: String(doc.year ?? deriveYear(doc.documentDate) ?? ""),
      file: null,
      existingFileName: doc.filename ?? null
    });
    setYearTouched(false);
    setFormError(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setUploadProgress(0);
  };

  const handleDocumentDateChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      documentDate: value,
      year: yearTouched ? prev.year : deriveYear(value)
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    setUploadProgress(0);

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

      const documentType = (forcedDocumentType ?? formState.documentType) || "autre";
      const payload = {
        title,
        documentType,
        documentDate,
        year: formState.year ? Number(formState.year) : undefined
      };

      if (formState.file) {
        const existingNames = new Set(
          documents.map((doc) => doc.filename ?? "").filter(Boolean)
        );
        const renamed = buildFileName(
          formState.title,
          documentType,
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
        await uploadWithProgress(editingId ? "PATCH" : "POST", url, formData, setUploadProgress);
      } else {
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

      const docs = await fetchDocuments({ documentType: documentTypeFilter, limit: 200 });
      setDocuments(docs);
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (doc: DocumentItem) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const docs = await fetchDocuments({ documentType: documentTypeFilter, limit: 200 });
      setDocuments(docs);
    } catch {
      setFormError("Suppression impossible.");
    }
  };

  return (
    <div className="space-y-8">
      {canEdit ? (
        <div className="space-y-4">
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

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <SearchInput value={adminQuery} onChange={setAdminQuery} placeholder="Rechercher" />
            <label className="text-sm text-slate">
              Annee
              <select
                className="mt-1 w-full glass-select"
                value={adminYearFilter}
                onChange={(event) => setAdminYearFilter(event.target.value)}
              >
                {adminYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="overflow-hidden glass-panel">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 border-b border-ink/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate">
              <span>Titre</span>
              <span>Type</span>
              <span>Date</span>
              <span>Upload</span>
              <span className="text-right">Actions</span>
            </div>
            {adminResults.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate">Aucun document.</div>
            ) : (
              adminResults.map((doc) => (
                <div
                  key={String(doc.id)}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 border-b border-ink/5 px-4 py-3 text-sm text-ink last:border-b-0"
                >
                  <span className="font-semibold">{doc.title}</span>
                  <span className="text-slate">{typeLabel(doc.documentType)}</span>
                  <span className="text-slate">{formatDate(doc.documentDate)}</span>
                  <span className="text-slate">{formatDate(doc.createdAt)}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(doc)}
                      className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc)}
                      className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {isLoading ? <p className="text-sm text-slate">Chargement...</p> : null}

      {showPublicYearFilter && years.length > 1 ? (
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <span className="text-sm text-slate">
            Filtrer les documents par annee.
          </span>
          <label className="text-sm text-slate">
            Annee
            <select
              className="mt-1 w-full glass-select"
              value={publicYearFilter}
              onChange={(event) => setPublicYearFilter(event.target.value)}
            >
              {publicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {documents.length === 0 ? (
        <p className="text-sm text-slate">Aucun document disponible.</p>
      ) : (
        <div className="space-y-4">
          {visibleYears.map((year) => {
            const docs = groupedDocuments.get(year) ?? [];
            const isOpen = openYears.has(year);
            return (
              <div key={year} className="overflow-hidden glass-panel">
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  className="flex w-full items-center justify-between bg-fog px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate">Annee</p>
                    <p className="text-2xl font-display text-ink">Annee {year}</p>
                  </div>
                  <span className="text-3xl font-display text-ink">{isOpen ? "–" : "+"}</span>
                </button>

                {isOpen ? (
                  <div className="divide-y divide-ink/10 px-5">
                    {docs.length === 0 ? (
                      <p className="py-4 text-sm text-slate">Aucun document pour {year}.</p>
                    ) : (
                      docs.map((doc) => {
                        const viewerHref = `${viewerBasePath}/${doc.id}`;
                        const isDocPdf = isPdf(doc);
                        return (
                          <div key={String(doc.id)} className="py-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {isDocPdf ? (
                                <a
                                  href={viewerHref}
                                  className="text-base font-semibold text-rose-600 hover:text-rose-700"
                                >
                                  {doc.title}
                                </a>
                              ) : (
                                <a
                                  href={doc.url ?? "#"}
                                  download
                                  className="text-base font-semibold text-rose-600 hover:text-rose-700"
                                >
                                  {doc.title}
                                </a>
                              )}
                              <span className="text-xs uppercase tracking-[0.25em] text-slate">
                                {typeLabel(doc.documentType)}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate">
                              <span>Date du document: {formatDate(doc.documentDate)}</span>
                              <span>Date d'upload: {formatDate(doc.createdAt)}</span>
                              <span>Type: {typeLabel(doc.documentType)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : null}
              </div>
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
                  Document
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
                  Type de document
                  {forcedDocumentType ? (
                    <input
                      type="text"
                      value={typeLabel(forcedDocumentType)}
                      readOnly
                      className="mt-2 w-full glass-input"
                    />
                  ) : (
                    <select
                      value={formState.documentType}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, documentType: event.target.value }))
                      }
                      className="mt-2 w-full glass-input"
                      required
                    >
                      {documentTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-ink/80">
                  Date du document
                  <input
                    type="date"
                    value={formState.documentDate}
                    onChange={(event) => handleDocumentDateChange(event.target.value)}
                    className="mt-2 w-full glass-input"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-ink/80">
                  Annee
                  <input
                    type="number"
                    value={formState.year}
                    onChange={(event) => {
                      setYearTouched(true);
                      setFormState((prev) => ({ ...prev, year: event.target.value }));
                    }}
                    className="mt-2 w-full glass-input"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-ink/80">
                Fichier
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.odt,.png,.jpg,.jpeg"
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))
                  }
                  className="mt-2 w-full glass-input"
                  required={!editingId}
                />
                {formState.existingFileName ? (
                  <p className="mt-2 text-xs text-slate">
                    Fichier actuel: {formState.existingFileName}
                  </p>
                ) : null}
              </label>

              {uploadProgress > 0 && isSaving ? (
                <p className="text-xs text-slate">Upload: {uploadProgress}%</p>
              ) : null}

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
