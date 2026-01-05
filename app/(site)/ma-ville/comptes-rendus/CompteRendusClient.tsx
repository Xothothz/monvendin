"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { hasPermission, type UserWithPermissions } from "@/lib/permissions";

type ReportDoc =
  | {
      id?: string;
      _id?: string;
      url?: string;
      filename?: string;
    }
  | string
  | null;

type CouncilReport = {
  id: string | number;
  date: string;
  agendaDoc?: ReportDoc;
  minutesDoc?: ReportDoc;
  status?: "draft" | "published";
};

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

type ReportFormState = {
  date: string;
  status: "draft" | "published";
  agendaFile: File | null;
  minutesFile: File | null;
  agendaDocId: string | null;
  minutesDocId: string | null;
  agendaName: string;
  minutesName: string;
};

const emptyFormState: ReportFormState = {
  date: "",
  status: "published",
  agendaFile: null,
  minutesFile: null,
  agendaDocId: null,
  minutesDocId: null,
  agendaName: "",
  minutesName: ""
};

const getDocInfo = (doc?: ReportDoc) => {
  if (!doc) {
    return { id: null, url: null, filename: null };
  }
  if (typeof doc === "string") {
    return { id: doc, url: null, filename: null };
  }

  return {
    id: doc.id ?? doc._id ?? null,
    url: doc.url ?? null,
    filename: doc.filename ?? null
  };
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const getYear = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
};

const toISODate = (value: string) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
};

const uploadDocument = async (file: File, title: string, documentDate: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "_payload",
    JSON.stringify({
      title,
      documentType: "autre",
      documentDate: toISODate(documentDate)
    })
  );

  const response = await fetch("/api/documents", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Upload document impossible.");
  }

  const data = await response.json();
  return data?.doc?.id ?? data?.id ?? null;
};

const fetchReports = async () => {
  const response = await fetch("/api/council-reports?depth=1&limit=200&sort=-date", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Chargement impossible.");
  }

  const data = await response.json();
  return (data?.docs ?? []) as CouncilReport[];
};

export const CompteRendusClient = ({ initialReports }: { initialReports: CouncilReport[] }) => {
  const [reports, setReports] = useState<CouncilReport[]>(initialReports);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<ReportFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(true);

  const canEdit = hasPermission(user, "manageCouncilReports");

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
        const docs = await fetchReports();
        if (isActive) {
          setReports(docs);
        }
      } catch {
        if (isActive) {
          setReports((prev) => prev);
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

  const sortedReports = useMemo(() => {
    const next = [...reports];
    next.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return sortDescending ? bTime - aTime : aTime - bTime;
    });
    return next;
  }, [reports, sortDescending]);

  const filteredReports = useMemo(() => {
    if (!query.trim()) return sortedReports;
    const needle = query.trim().toLowerCase();

    return sortedReports.filter((report) => {
      const year = getYear(report.date);
      const dateLabel = formatDate(report.date).toLowerCase();
      const agenda = getDocInfo(report.agendaDoc);
      const minutes = getDocInfo(report.minutesDoc);
      const agendaName = agenda.filename?.toLowerCase() ?? "";
      const minutesName = minutes.filename?.toLowerCase() ?? "";

      return (
        year.includes(needle) ||
        dateLabel.includes(needle) ||
        agendaName.includes(needle) ||
        minutesName.includes(needle)
      );
    });
  }, [query, sortedReports]);

  const openCreate = () => {
    setFormState(emptyFormState);
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (report: CouncilReport) => {
    const agendaInfo = getDocInfo(report.agendaDoc);
    const minutesInfo = getDocInfo(report.minutesDoc);

    setFormState({
      date: report.date?.slice(0, 10) ?? "",
      status: report.status ?? "published",
      agendaFile: null,
      minutesFile: null,
      agendaDocId: agendaInfo.id ? String(agendaInfo.id) : null,
      minutesDocId: minutesInfo.id ? String(minutesInfo.id) : null,
      agendaName: agendaInfo.filename ?? "",
      minutesName: minutesInfo.filename ?? ""
    });
    setEditingId(String(report.id));
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const refreshReports = async () => {
    setIsLoading(true);
    try {
      const docs = await fetchReports();
      setReports(docs);
    } catch {
      setReports((prev) => prev);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      if (!formState.date) {
        setFormError("La date est obligatoire.");
        setIsSaving(false);
        return;
      }

      let agendaDocId = formState.agendaDocId;
      let minutesDocId = formState.minutesDocId;

      if (formState.agendaFile) {
        agendaDocId = await uploadDocument(
          formState.agendaFile,
          "Ordre du jour",
          formState.date
        );
      }
      if (formState.minutesFile) {
        minutesDocId = await uploadDocument(
          formState.minutesFile,
          "Compte rendu",
          formState.date
        );
      }

      if (!agendaDocId || !minutesDocId) {
        setFormError("Les deux fichiers PDF sont obligatoires.");
        setIsSaving(false);
        return;
      }

      const payload = {
        date: formState.date,
        status: formState.status,
        agendaDoc: agendaDocId,
        minutesDoc: minutesDocId
      };

      const response = await fetch(
        editingId ? `/api/council-reports/${editingId}` : "/api/council-reports",
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

      await refreshReports();
      setIsModalOpen(false);
      setEditingId(null);
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm("Supprimer ce compte rendu ?")) {
      return;
    }

    setFormError(null);
    setDeletingId(reportId);
    try {
      const response = await fetch(`/api/council-reports/${reportId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }

      await refreshReports();
    } catch {
      setFormError("Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-ink/60">
              Recherche
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Annee, date, fichier..."
                className="mt-2 w-56 glass-select"
              />
            </label>
            <button
              type="button"
              onClick={() => setSortDescending((prev) => !prev)}
              className="mt-6 rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-gold hover:text-ink"
            >
              Trier par date {sortDescending ? "(desc)" : "(asc)"}
            </button>
          </div>
          {canEdit ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold transition hover:bg-gold hover:text-ink"
            >
              + Ajouter un compte rendu
            </button>
          ) : null}
        </div>
      </Card>

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-3 glass-panel px-4 py-3 text-xs font-semibold uppercase tracking-widest text-ink/70">
          <span>Mode admin actif</span>
          {isLoading ? <span className="text-ink/40">Mise a jour...</span> : null}
        </div>
      ) : null}
      {canEdit && formError && !isModalOpen ? (
        <p className="text-sm text-red-600">{formError}</p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-fog/70 text-xs font-semibold uppercase tracking-widest text-ink/60">
              <tr>
                <th className="px-4 py-3">Annee</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Ordre du jour</th>
                <th className="px-4 py-3">Compte rendu et deliberation</th>
                {canEdit ? <th className="px-4 py-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate" colSpan={canEdit ? 5 : 4}>
                    Aucun compte rendu disponible.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const agenda = getDocInfo(report.agendaDoc);
                  const minutes = getDocInfo(report.minutesDoc);
                  const dateLabel = formatDate(report.date);
                  const yearLabel = getYear(report.date);

                  return (
                    <tr key={String(report.id)} className="border-t border-ink/5">
                      <td className="px-4 py-4 font-semibold text-ink/80">{yearLabel}</td>
                      <td className="px-4 py-4 text-ink/70">{dateLabel}</td>
                      <td className="px-4 py-4">
                        {agenda.url ? (
                          <a
                            href={agenda.url}
                            download
                            className="text-sm font-semibold text-ink hover:text-gold"
                          >
                            Telecharger
                          </a>
                        ) : (
                          <span className="text-slate">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {minutes.url ? (
                          <a
                            href={minutes.url}
                            download
                            className="text-sm font-semibold text-ink hover:text-gold"
                          >
                            Telecharger
                          </a>
                        ) : (
                          <span className="text-slate">-</span>
                        )}
                      </td>
                      {canEdit ? (
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(report)}
                              className="rounded-full border border-ink/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink/70 hover:border-gold hover:text-ink"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(String(report.id))}
                              disabled={deletingId === String(report.id)}
                              className="rounded-full border border-red-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-600 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === String(report.id) ? "Suppression..." : "Supprimer"}
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
                  {editingId ? "Modifier un compte rendu" : "Nouveau compte rendu"}
                </p>
                <h2 className="mt-2 text-2xl font-display">
                  {editingId ? "Edition" : "Ajouter un compte rendu"}
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

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-ink/80">
                  Ordre du jour (PDF)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        agendaFile: event.target.files?.[0] ?? null
                      }))
                    }
                    className="mt-2 w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white hover:file:bg-ink/90"
                  />
                  {formState.agendaName ? (
                    <p className="mt-2 text-xs text-ink/60">Fichier actuel: {formState.agendaName}</p>
                  ) : null}
                </label>
                <label className="text-sm font-semibold text-ink/80">
                  Compte rendu et deliberation (PDF)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        minutesFile: event.target.files?.[0] ?? null
                      }))
                    }
                    className="mt-2 w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white hover:file:bg-ink/90"
                  />
                  {formState.minutesName ? (
                    <p className="mt-2 text-xs text-ink/60">Fichier actuel: {formState.minutesName}</p>
                  ) : null}
                </label>
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
