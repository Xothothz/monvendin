"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { RichTextEditor } from "@/components/RichTextEditor";

type AdminUser = {
  email?: string;
  name?: string;
  role?: "admin" | "editor";
};

type AProposContentProps = {
  slug: string;
  initialContent: string;
  initialContentId?: string | null;
};

export const AProposContent = ({
  slug,
  initialContent,
  initialContentId
}: AProposContentProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [content, setContent] = useState(initialContent);
  const [contentId, setContentId] = useState<string | null>(initialContentId ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formContent, setFormContent] = useState(initialContent);

  const canEdit = user?.role === "admin";

  const renderedContent = useMemo(() => renderMarkdown(content), [content]);

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
    setFormContent(content);
    setFormError(null);
  }, [isModalOpen, content]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const nextContent = formContent.trim();
      if (!nextContent) {
        setFormError("Le contenu est obligatoire.");
        setIsSaving(false);
        return;
      }

      const payload = {
        slug,
        content: nextContent
      };

      const response = await fetch(
        contentId ? `/api/page-contents/${contentId}` : "/api/page-contents",
        {
          method: contentId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

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
      setContent(nextContent);
      setIsModalOpen(false);
    } catch {
      setFormError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 hover:bg-goldSoft"
          >
            Modifier le contenu
          </button>
        </div>
      ) : null}

      <article
        id="sources"
        className="text-slate space-y-4"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
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
            onClick={() => setIsModalOpen(false)}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  A propos
                </p>
                <h2 className="mt-2 text-2xl font-display">Modifier le contenu</h2>
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
              <div className="block text-sm font-semibold text-ink/80">
                <p>Contenu</p>
                <div className="mt-2">
                  <RichTextEditor
                    value={formContent}
                    onChange={(value) => setFormContent(value)}
                  />
                </div>
              </div>

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
    </div>
  );
};
