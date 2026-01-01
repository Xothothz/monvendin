"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";

type AdminUser = {
  email?: string;
  name?: string;
  role?: "admin" | "editor";
};

type PoliceMunicipaleContactContentProps = {
  slug: string;
  initialIntro: string;
  initialMissions: string[];
  initialContentId?: string | null;
};

export const PoliceMunicipaleContactContent = ({
  slug,
  initialIntro,
  initialMissions,
  initialContentId
}: PoliceMunicipaleContactContentProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [intro, setIntro] = useState(initialIntro);
  const [missions, setMissions] = useState<string[]>(initialMissions);
  const [contentId, setContentId] = useState<string | null>(initialContentId ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formIntro, setFormIntro] = useState(initialIntro);
  const [formMissions, setFormMissions] = useState(initialMissions.join("\n"));

  const canEdit = user?.role === "admin";

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
    if (!isModalOpen) return;
    setFormIntro(intro);
    setFormMissions(missions.join("\n"));
    setFormError(null);
  }, [isModalOpen, intro, missions]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const nextMissions = formMissions
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const payload = {
        slug,
        intro: formIntro.trim(),
        missions: nextMissions.map((label) => ({ label }))
      };

      const response = await fetch(contentId ? `/api/page-texts/${contentId}` : "/api/page-texts", {
        method: contentId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data?.errors?.[0]?.message || data?.message || "Enregistrement impossible.";
        setFormError(message);
        setIsSaving(false);
        return;
      }

      const data = await response.json().catch(() => ({}));
      const nextId = data?.doc?.id ?? data?.id ?? contentId;
      setContentId(nextId ? String(nextId) : contentId);
      setIntro(formIntro.trim());
      setMissions(nextMissions);
      setIsModalOpen(false);
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand/40">
          <img
            src="/images/police-municipale-contact.png"
            alt="Police municipale intercommunale"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate">{intro}</p>
            {canEdit ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-full border border-ink/10 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/70 hover:bg-goldSoft"
              >
                Modifier le texte
              </button>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70">
              Leurs missions :
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate space-y-1">
              {missions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={() => setIsModalOpen(false)}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Police municipale
                </p>
                <h2 className="mt-2 text-2xl font-display">Modifier le texte</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
              <label className="block text-sm font-semibold text-ink/80">
                Texte principal
                <textarea
                  value={formIntro}
                  onChange={(event) => setFormIntro(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </label>
              <label className="block text-sm font-semibold text-ink/80">
                Missions (une par ligne)
                <textarea
                  value={formMissions}
                  onChange={(event) => setFormMissions(event.target.value)}
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </label>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70"
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
    </Card>
  );
};
