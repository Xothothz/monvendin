"use client";

type ConfirmDeleteModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmDeleteModal = ({
  open,
  title,
  message,
  confirmLabel,
  isLoading,
  onConfirm,
  onClose
}: ConfirmDeleteModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10" role="dialog">
      <button
        type="button"
        className="absolute inset-0 bg-ink/60"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-ink shadow-2xl">
        <h2 className="text-lg font-display text-ink">
          {title ?? "Confirmer la suppression"}
        </h2>
        <p className="mt-3 text-sm text-slate">
          {message ?? "Cette action est definitive."}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Suppression..." : confirmLabel ?? "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};
