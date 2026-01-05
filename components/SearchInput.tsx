"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-4 py-3 backdrop-blur-md ring-1 ring-ink/5 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <MagnifyingGlass className="h-4 w-4 text-slate" aria-hidden="true" />
      <input
        className="w-full bg-transparent text-sm focus:outline-none"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Rechercher"}
        aria-label="Recherche"
      />
    </label>
  );
};
