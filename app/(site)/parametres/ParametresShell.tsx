"use client";

import { useState } from "react";
import clsx from "clsx";
import { ParametresUsersPanel } from "./ParametresUsersPanel";

type SectionId = "users" | "permissions";

const sections: Array<{
  id: SectionId;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    id: "users",
    label: "Utilisateurs",
    description: "Gestion des comptes et des droits."
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Parametrage avance (bientot).",
    disabled: true
  }
];

export const ParametresShell = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("users");

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
      <aside className="rounded-3xl border border-ink/10 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate">
          Menu
        </p>
        <nav className="mt-4 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              disabled={section.disabled}
              className={clsx(
                "flex w-full flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition",
                activeSection === section.id
                  ? "border-gold/40 bg-gold/10 text-ink"
                  : "border-ink/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink",
                section.disabled && "cursor-not-allowed opacity-50"
              )}
              aria-current={activeSection === section.id ? "page" : undefined}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                {section.label}
              </span>
              <span className="text-xs text-slate">{section.description}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div>
        {activeSection === "users" ? <ParametresUsersPanel /> : null}
      </div>
    </div>
  );
};
