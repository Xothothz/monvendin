"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";

export const ParametresAccess = () => {
  const handleOpenLogin = useCallback(() => {
    window.dispatchEvent(new CustomEvent("admin-login-open"));
  }, []);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-display text-ink">Acces reserve</h2>
      <p className="text-sm text-slate">
        Cette page est reservee aux administrateurs. Connectez-vous avec un compte
        admin pour continuer.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleOpenLogin}
          className="rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold transition hover:bg-gold hover:text-ink"
        >
          Ouvrir la connexion admin
        </button>
        <Link href="/admin" className="text-xs font-semibold uppercase tracking-widest text-ink">
          Aller vers la page de connexion
        </Link>
      </div>
    </Card>
  );
};
