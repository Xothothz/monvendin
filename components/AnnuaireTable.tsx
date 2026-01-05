"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CaretUpDown } from "@phosphor-icons/react";
import { SearchInput } from "@/components/SearchInput";
import { AnnuaireFormModal, type AnnuaireEntryInput } from "@/components/AnnuaireFormModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type AnnuaireEntry = {
  id: string | number;
  categorie?: string | null;
  sousCategorie?: string | null;
  nom?: string | null;
  prenom?: string | null;
  denomination?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  telephone?: string | null;
  portable?: string | null;
  mail?: string | null;
  siteInternet?: string | null;
  createdAt?: string | null;
};

type AnnuaireResponse = {
  docs: AnnuaireEntry[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
};

type AdminUser = UserWithPermissions;

type AnnuaireTableProps = {
  initialData: AnnuaireResponse;
  columns?: ColumnConfig[];
  categories?: { label: string; value: string }[];
  categoryFilter?: string;
  defaultCategory?: string;
  defaultSortKey?: ColumnKey;
};

const defaultCategories = [
  { label: "Commerce", value: "commerce" },
  { label: "Artisanat", value: "artisanat" },
  { label: "Services", value: "services" },
  { label: "Sante", value: "sante" },
  { label: "Education", value: "education" },
  { label: "Association", value: "association" },
  { label: "Autre", value: "autre" }
];

const defaultColumns = [
  { key: "categorie", label: "Categorie" },
  { key: "sousCategorie", label: "Sous-categorie" },
  { key: "nom", label: "Nom" },
  { key: "prenom", label: "Prenom" },
  { key: "denomination", label: "Denomination" },
  { key: "adresse", label: "Adresse" },
  { key: "ville", label: "Ville" },
  { key: "telephone", label: "Telephone" },
  { key: "portable", label: "Portable" },
  { key: "mail", label: "Mail" },
  { key: "siteInternet", label: "Site" }
] as const;

type ColumnKey =
  | "categorie"
  | "sousCategorie"
  | "nom"
  | "prenom"
  | "denomination"
  | "adresse"
  | "codePostal"
  | "ville"
  | "telephone"
  | "portable"
  | "mail"
  | "siteInternet";

type ColumnConfig = {
  key: ColumnKey;
  label: string;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type ImportError = {
  row: number;
  message: string;
};

const formatValue = (value?: string | null) => {
  if (!value) return "—";
  return value;
};

const formatCategory = (
  value: string | null | undefined,
  categories: typeof defaultCategories
) => {
  if (!value) return "—";
  return categories.find((item) => item.value === value)?.label ?? value;
};

const headers = [
  "Categorie",
  "Sous categorie",
  "Nom",
  "Prenom",
  "Denomination",
  "Adresse",
  "Code postal",
  "Ville",
  "Telephone",
  "Portable",
  "Mail",
  "Site internet"
];

const normalizeString = (value: unknown) => String(value ?? "").trim();

const matchCategory = (value: string, categories: typeof defaultCategories) => {
  if (!value) return "";
  const normalized = value.toLowerCase();
  const match = categories.find(
    (item) =>
      item.value.toLowerCase() === normalized ||
      item.label.toLowerCase() === normalized
  );
  return match ? match.value : "autre";
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUrl = (value: string) => {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    new URL(candidate);
    return true;
  } catch {
    return false;
  }
};

const withProtocol = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

export const AnnuaireTable = ({
  initialData,
  columns,
  categories,
  categoryFilter,
  defaultCategory,
  defaultSortKey
}: AnnuaireTableProps) => {
  const activeColumns = columns ?? defaultColumns;
  const activeCategories = categories ?? defaultCategories;
  const resolvedDefaultCategory = defaultCategory ?? categoryFilter ?? "";
  const [entries, setEntries] = useState<AnnuaireEntry[]>(initialData.docs ?? []);
  const [totalDocs, setTotalDocs] = useState(initialData.totalDocs ?? 0);
  const [page, setPage] = useState(initialData.page ?? 1);
  const [limit, setLimit] = useState(initialData.limit ?? 10);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<ColumnKey>(defaultSortKey ?? "denomination");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AnnuaireEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnuaireEntry | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canEdit = hasPermission(user, "manageAssociations");

  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
  const rangeStart = totalDocs === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalDocs);

  const sortParam = useMemo(
    () => (sortDirection === "desc" ? `-${sortKey}` : sortKey),
    [sortDirection, sortKey]
  );

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  const fetchEntries = async (nextPage = page) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", String(limit));
      params.set("sort", sortParam);
      if (query.trim()) {
        params.set("search", query.trim());
      }
      if (categoryFilter) {
        params.set("categorie", categoryFilter);
      }

      const response = await fetch(`/api/annuaire?${params.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Chargement impossible.");
      }
      const data = (await response.json()) as AnnuaireResponse;
      setEntries(data.docs ?? []);
      setTotalDocs(data.totalDocs ?? 0);
      setPage(data.page ?? nextPage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  };

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
    const timer = window.setTimeout(() => {
      fetchEntries(1);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, limit, sortParam]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSort = (key: ColumnKey) => {
    setSortDirection((prev) => (sortKey === key ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortKey(key);
  };

  const openCreate = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const openEdit = (entry: AnnuaireEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSave = async (data: AnnuaireEntryInput) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        editingEntry ? `/api/annuaire/${editingEntry.id}` : "/api/annuaire",
        {
          method: editingEntry ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Enregistrement impossible.");
      }

      setToast({
        type: "success",
        message: editingEntry ? "Entree mise a jour." : "Entree ajoutee."
      });
      closeModal();
      await fetchEntries();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Enregistrement impossible.";
      setToast({ type: "error", message });
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formInitialValue = useMemo(() => {
    if (editingEntry) {
      return {
        categorie: editingEntry.categorie ?? "",
        sousCategorie: editingEntry.sousCategorie ?? "",
        nom: editingEntry.nom ?? "",
        prenom: editingEntry.prenom ?? "",
        denomination: editingEntry.denomination ?? "",
        adresse: editingEntry.adresse ?? "",
        codePostal: editingEntry.codePostal ?? "",
        ville: editingEntry.ville ?? "",
        telephone: editingEntry.telephone ?? "",
        portable: editingEntry.portable ?? "",
        mail: editingEntry.mail ?? "",
        siteInternet: editingEntry.siteInternet ?? ""
      } satisfies Partial<AnnuaireEntryInput>;
    }
    if (resolvedDefaultCategory) {
      return { categorie: resolvedDefaultCategory };
    }
    return null;
  }, [editingEntry, resolvedDefaultCategory]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/annuaire/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Suppression impossible.");
      }
      setToast({ type: "success", message: "Entree supprimee." });
      setDeleteTarget(null);
      await fetchEntries();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Suppression impossible.";
      setToast({ type: "error", message });
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadXlsx = async () => {
    return import("xlsx");
  };

  const fetchAllEntries = async () => {
    const all: AnnuaireEntry[] = [];
    let currentPage = 1;
    let total = 1;
    const batchLimit = 200;

    while (currentPage <= total) {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(batchLimit));
      params.set("sort", sortParam);
      if (query.trim()) {
        params.set("search", query.trim());
      }
      if (categoryFilter) {
        params.set("categorie", categoryFilter);
      }

      const response = await fetch(`/api/annuaire?${params.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Export impossible.");
      }
      const data = (await response.json()) as AnnuaireResponse;
      all.push(...(data.docs ?? []));
      total = data.totalPages ?? 1;
      currentPage += 1;
    }

    return all;
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await loadXlsx();
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([headers, []]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Annuaire");
    XLSX.writeFile(workbook, "annuaire-template.xlsx");
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const XLSX = await loadXlsx();
      const allEntries = await fetchAllEntries();
      const rows = allEntries.map((entry) => ({
        "Categorie": formatCategory(entry.categorie ?? null, activeCategories),
        "Sous categorie": formatValue(entry.sousCategorie),
        "Nom": formatValue(entry.nom),
        "Prenom": formatValue(entry.prenom),
        "Denomination": formatValue(entry.denomination),
        "Adresse": formatValue(entry.adresse),
        "Code postal": formatValue(entry.codePostal),
        "Ville": formatValue(entry.ville),
        "Telephone": formatValue(entry.telephone),
        "Portable": formatValue(entry.portable),
        "Mail": formatValue(entry.mail),
        "Site internet": formatValue(entry.siteInternet)
      }));

      const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Annuaire");
      XLSX.writeFile(workbook, "annuaire-export.xlsx");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export impossible.";
      setToast({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);
    setErrorMessage(null);
    const errors: ImportError[] = [];

    try {
      const XLSX = await loadXlsx();
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: ""
      });

      const entriesToCreate: AnnuaireEntryInput[] = [];

      rows.forEach((row, index) => {
        const categorie = normalizeString(row["Categorie"] ?? row["Catégorie"] ?? row["categorie"]);
        const sousCategorie = normalizeString(row["Sous categorie"] ?? row["Sous-categorie"] ?? row["sousCategorie"]);
        const nom = normalizeString(row["Nom"] ?? row["nom"]);
        const prenom = normalizeString(row["Prenom"] ?? row["prenom"]);
        const denomination = normalizeString(row["Denomination"] ?? row["denomination"]);
        const adresse = normalizeString(row["Adresse"] ?? row["adresse"]);
        const codePostal = normalizeString(
          row["Code postal"] ?? row["Code Postal"] ?? row["codePostal"]
        );
        const ville = normalizeString(row["Ville"] ?? row["ville"]);
        const telephone = normalizeString(row["Telephone"] ?? row["telephone"]);
        const portable = normalizeString(row["Portable"] ?? row["portable"]);
        const mail = normalizeString(row["Mail"] ?? row["mail"]);
        const siteInternet = normalizeString(row["Site internet"] ?? row["Site"] ?? row["siteInternet"]);

        const hasContent =
          categorie ||
          sousCategorie ||
          nom ||
          prenom ||
          denomination ||
          adresse ||
          codePostal ||
          ville ||
          telephone ||
          portable ||
          mail ||
          siteInternet;

        if (!hasContent) return;

        if (mail && !isValidEmail(mail)) {
          errors.push({ row: index + 2, message: "Mail invalide." });
          return;
        }

        if (siteInternet && !isValidUrl(siteInternet)) {
          errors.push({ row: index + 2, message: "URL invalide." });
          return;
        }

        const resolvedCategory = categoryFilter
          ? resolvedDefaultCategory
          : categorie
            ? matchCategory(categorie, activeCategories)
            : resolvedDefaultCategory;

        entriesToCreate.push({
          categorie: resolvedCategory,
          sousCategorie,
          nom,
          prenom,
          denomination,
          adresse,
          codePostal,
          ville,
          telephone,
          portable,
          mail,
          siteInternet
        });
      });

      if (entriesToCreate.length === 0) {
        setToast({ type: "error", message: "Aucune entree a importer." });
        setIsImporting(false);
        return;
      }

      for (let index = 0; index < entriesToCreate.length; index += 1) {
        const entry = entriesToCreate[index];
        const response = await fetch("/api/annuaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(entry)
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          errors.push({
            row: index + 2,
            message: payload?.message || "Erreur d'import."
          });
        }
        setImportProgress(Math.round(((index + 1) / entriesToCreate.length) * 100));
      }

      await fetchEntries(1);
      setPage(1);

      if (errors.length > 0) {
        const preview = errors.slice(0, 3).map((errorItem) => `Ligne ${errorItem.row}`);
        setToast({
          type: "error",
          message: `Import partiel (${errors.length} erreurs). ${preview.join(", ")}`
        });
      } else {
        setToast({ type: "success", message: "Import termine." });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import impossible.";
      setToast({ type: "error", message });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">
            Afficher
            <select
              className="ml-2 glass-select px-3 py-2 text-xs"
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher" />
        </div>
        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/70 hover:bg-goldSoft"
            >
              Modele Excel
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/70 hover:bg-goldSoft disabled:opacity-60"
            >
              {isImporting ? `Import ${importProgress}%` : "Importer Excel"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/70 hover:bg-goldSoft"
            >
              Exporter Excel
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-ink/70 hover:bg-goldSoft"
            >
              Ajouter
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleImport(file);
                }
              }}
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {isLoading ? <p className="text-sm text-slate">Chargement...</p> : null}

      <div className="glass-panel">
        <table className="w-full table-fixed text-left text-xs md:text-sm">
          <thead className="bg-fog text-[10px] uppercase tracking-[0.22em] text-slate">
            <tr>
              {activeColumns.map((column) => (
                <th key={column.key} className="px-3 py-3 font-semibold break-words">
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2"
                  >
                    {column.label}
                    <CaretUpDown className="h-4 w-4 text-slate" />
                  </button>
                </th>
              ))}
              {canEdit ? <th className="px-3 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={canEdit ? activeColumns.length + 1 : activeColumns.length}
                  className="px-4 py-6 text-center text-slate"
                >
                  Aucune entree.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={String(entry.id)} className="hover:bg-sand">
                  {activeColumns.map((column) => {
                    if (column.key === "categorie") {
                      return (
                        <td key={column.key} className="px-3 py-3 break-words">
                          {formatCategory(entry.categorie ?? null, activeCategories)}
                        </td>
                      );
                    }
                    if (column.key === "mail") {
                      return (
                        <td key={column.key} className="px-3 py-3 break-all">
                          {entry.mail ? (
                            <a
                              href={`mailto:${entry.mail}`}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              {entry.mail}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    }
                    if (column.key === "siteInternet") {
                      return (
                        <td key={column.key} className="px-3 py-3 break-all">
                          {entry.siteInternet ? (
                            <a
                              href={withProtocol(entry.siteInternet)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-rose-600 hover:text-rose-700"
                            >
                              {entry.siteInternet}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    }
                    return (
                      <td key={column.key} className="px-3 py-3 break-words">
                        {formatValue(entry[column.key] as string | null)}
                      </td>
                    );
                  })}
                  {canEdit ? (
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(entry)}
                          className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(entry)}
                          className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate">
        <span>
          Affichage des elements {rangeStart} a {rangeEnd} sur {totalDocs}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (page > 1) {
                const nextPage = page - 1;
                setPage(nextPage);
                fetchEntries(nextPage);
              }
            }}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 disabled:opacity-40"
            disabled={page <= 1 || isLoading}
          >
            Precedent
          </button>
          {pages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => {
                setPage(pageNumber);
                fetchEntries(pageNumber);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                pageNumber === page
                  ? "border-ink bg-ink text-white"
                  : "border-ink/10 text-ink/70"
              }`}
              disabled={isLoading}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (page < totalPages) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchEntries(nextPage);
              }
            }}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 disabled:opacity-40"
            disabled={page >= totalPages || isLoading}
          >
            Suivant
          </button>
        </div>
      </div>

      {toast ? (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <AnnuaireFormModal
        open={isModalOpen}
        title={editingEntry ? "Modifier une entree" : "Ajouter une entree"}
        categories={activeCategories}
        initialValue={formInitialValue}
        isSaving={isSaving}
        onClose={closeModal}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Supprimer l'entree"
        message="Voulez-vous vraiment supprimer cette entree ?"
        isLoading={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
