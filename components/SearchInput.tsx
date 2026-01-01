"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => {
  return (
    <label className="flex items-center gap-2 rounded-lg bg-white border border-ink/15 px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.08)]">
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
