"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FacebookLogo } from "@phosphor-icons/react";
import { type UserWithPermissions } from "@/lib/permissions";

type AdminUser = UserWithPermissions & {
  email?: string;
  name?: string;
};

const AdminAuthControls = () => {
  const dialogId = useId();
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [formState, setFormState] = useState({
    email: "",
    password: ""
  });

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
    if (isOpen) {
      setError(null);
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => {
      if (!user) {
        setIsOpen(true);
      }
    };

    window.addEventListener("admin-login-open", handleOpen);
    return () => {
      window.removeEventListener("admin-login-open", handleOpen);
    };
  }, [user]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.errors?.[0]?.message ||
          data?.message ||
          "Identifiants invalides.";
        setError(message);
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      setUser(data?.user ?? null);
      setFormState({ email: "", password: "" });
      setIsOpen(false);
      window.location.reload();
    } catch {
      setError("Connexion impossible. Reessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      window.location.reload();
    } catch {
      setError("Deconnexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {user ? (
        <>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
            {isAdmin ? "Mode admin" : "Connecte"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Deconnexion
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold transition hover:bg-gold hover:text-ink"
        >
          Connexion
        </button>
      )}
      <Link
        href="/parametres"
        className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-gold hover:text-white"
      >
        Parametres
      </Link>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Acces
                </p>
                <h2 id={dialogId} className="mt-2 text-2xl font-display">
                  Connexion securisee
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Fermer
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <label className="block text-sm font-semibold text-ink/80">
                Email
                <input
                  ref={emailInputRef}
                  type="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-2 w-full glass-input"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-ink/80">
                Mot de passe
                <input
                  type="password"
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="mt-2 w-full glass-input"
                  required
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const SiteFooter = () => {
  return (
    <footer className="mt-6 border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Mairie
            </p>
            <div className="space-y-3">
              <p className="text-lg font-display text-white">
                Mairie de Vendin-l&#232;s-B&#233;thune (62)
              </p>
              <address className="not-italic text-sm text-white/70">
                <span className="block">209 rue Fran&#231;ois Mitterand</span>
                <span className="block">62232 Vendin-lez-Bethune</span>
              </address>
              <div className="space-y-1 text-sm">
                <a
                  href="tel:0321572621"
                  className="block text-white/80 no-link-underline hover:text-white"
                >
                  03 21 57 26 21
                </a>
                <a
                  href="mailto:mairie.vendinlesbethune@wanadoo.fr"
                  className="block text-white/80 no-link-underline hover:text-white"
                >
                  mairie.vendinlesbethune@wanadoo.fr
                </a>
                <a
                  href="https://www.google.com/maps?q=209+Rue+Francois+Mitterand+62232+Vendin-lez-Bethune"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-gold no-link-underline hover:text-white"
                >
                  Voir la mairie sur la carte
                </a>
              </div>
              <p className="text-[11px] text-white/50">
                Recherches frequentes : Vendin-l&#232;s-B&#233;thune, Vendin-lez-B&#233;thune,
                vendin les bethune, vendin les b&#233;thune.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Acces rapides
            </p>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link href="/actualites" className="no-link-underline hover:text-white">
                  Actualites locales
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="no-link-underline hover:text-white">
                  Agenda municipal
                </Link>
              </li>
              <li>
                <Link href="/infos" className="no-link-underline hover:text-white">
                  Historique des infos
                </Link>
              </li>
              <li>
                <Link href="/vie-pratique" className="no-link-underline hover:text-white">
                  Vie pratique
                </Link>
              </li>
              <li>
                <Link href="/ma-ville" className="no-link-underline hover:text-white">
                  Ma ville
                </Link>
              </li>
              <li>
                <Link href="/nous-contacter" className="no-link-underline hover:text-white">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Infos utiles
            </p>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link href="/a-propos" className="no-link-underline hover:text-white">
                  A propos / mentions
                </Link>
              </li>
              <li>
                <Link
                  href="/horaires-des-services"
                  className="no-link-underline hover:text-white"
                >
                  Horaires des services
                </Link>
              </li>
              <li>
                <Link href="/structure-du-site" className="no-link-underline hover:text-white">
                  Structure du site
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="no-link-underline hover:text-white"
                >
                  Sitemap
                </a>
              </li>
              <li>
                <Link href="/documents" className="no-link-underline hover:text-white">
                  Documents utiles
                </Link>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Suivez la ville en ligne
              </span>
              <a
                href="https://www.facebook.com/profile.php?id=100067033293725"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-gold/80 hover:text-ink"
                aria-label="Facebook"
              >
                <FacebookLogo className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-3">
            <span>monvendin.fr - portail citoyen independant</span>
            <span className="hidden sm:inline">Webmaster: GESTEAU Gregory</span>
          </div>
          <AdminAuthControls />
        </div>
      </div>
    </footer>
  );
};
