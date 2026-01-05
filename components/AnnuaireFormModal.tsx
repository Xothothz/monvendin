"use client";

import { useEffect, useState, type FormEvent } from "react";

export type AnnuaireEntryInput = {
  categorie: string;
  sousCategorie: string;
  nom: string;
  prenom: string;
  denomination: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  portable: string;
  mail: string;
  siteInternet: string;
};

type AnnuaireFormModalProps = {
  open: boolean;
  title: string;
  categories: { label: string; value: string }[];
  initialValue?: Partial<AnnuaireEntryInput> | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: AnnuaireEntryInput) => void;
};

const emptyState: AnnuaireEntryInput = {
  categorie: "",
  sousCategorie: "",
  nom: "",
  prenom: "",
  denomination: "",
  adresse: "",
  codePostal: "",
  ville: "",
  telephone: "",
  portable: "",
  mail: "",
  siteInternet: ""
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

export const AnnuaireFormModal = ({
  open,
  title,
  categories,
  initialValue,
  isSaving,
  onClose,
  onSave
}: AnnuaireFormModalProps) => {
  const [formState, setFormState] = useState<AnnuaireEntryInput>(emptyState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormState({
      ...emptyState,
      ...(initialValue ?? {})
    });
    setFormError(null);
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (formState.mail && !isValidEmail(formState.mail)) {
      setFormError("Adresse mail invalide.");
      return;
    }

    if (formState.siteInternet && !isValidUrl(formState.siteInternet)) {
      setFormError("URL invalide.");
      return;
    }

    onSave({
      ...formState,
      categorie: formState.categorie.trim(),
      sousCategorie: formState.sousCategorie.trim(),
      nom: formState.nom.trim(),
      prenom: formState.prenom.trim(),
      denomination: formState.denomination.trim(),
      adresse: formState.adresse.trim(),
      codePostal: formState.codePostal.trim(),
      ville: formState.ville.trim(),
      telephone: formState.telephone.trim(),
      portable: formState.portable.trim(),
      mail: formState.mail.trim(),
      siteInternet: formState.siteInternet.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10" role="dialog">
      <button
        type="button"
        className="absolute inset-0 bg-ink/70"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 text-ink shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              Annuaire
            </p>
            <h2 className="mt-2 text-2xl font-display">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            Fermer
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink/80">
              Categorie
              <select
                value={formState.categorie}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, categorie: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              >
                <option value="">Selectionner</option>
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink/80">
              Sous-categorie
              <input
                type="text"
                value={formState.sousCategorie}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, sousCategorie: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink/80">
              Nom
              <input
                type="text"
                value={formState.nom}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, nom: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
            <label className="block text-sm font-semibold text-ink/80">
              Prenom
              <input
                type="text"
                value={formState.prenom}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, prenom: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-ink/80">
            Denomination
            <input
              type="text"
              value={formState.denomination}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, denomination: event.target.value }))
              }
              className="mt-2 w-full glass-input"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink/80">
              Adresse
              <input
                type="text"
                value={formState.adresse}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, adresse: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
            <label className="block text-sm font-semibold text-ink/80">
              Code postal
              <input
                type="text"
                value={formState.codePostal}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, codePostal: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink/80">
              Ville
              <input
                type="text"
                value={formState.ville}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, ville: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
            <label className="block text-sm font-semibold text-ink/80">
              Telephone
              <input
                type="text"
                value={formState.telephone}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, telephone: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
            <label className="block text-sm font-semibold text-ink/80">
              Portable
              <input
                type="text"
                value={formState.portable}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, portable: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink/80">
              Mail
              <input
                type="email"
                value={formState.mail}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, mail: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
            <label className="block text-sm font-semibold text-ink/80">
              Site internet
              <input
                type="url"
                value={formState.siteInternet}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, siteInternet: event.target.value }))
                }
                className="mt-2 w-full glass-input"
              />
            </label>
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
  );
};
