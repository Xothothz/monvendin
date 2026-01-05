"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { DemarcheItem } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SearchInput } from "@/components/SearchInput";

const options = {
  keys: ["title", "description", "category", "steps"],
  threshold: 0.35
};

type DemarchesExplorerProps = {
  items: DemarcheItem[];
};

export const DemarchesExplorer = ({ items }: DemarchesExplorerProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category));
    return ["Toutes", ...Array.from(set)];
  }, [items]);

  const fuse = useMemo(() => new Fuse(items, options), [items]);

  const results = useMemo(() => {
    const filtered = category === "Toutes" ? items : items.filter((item) => item.category === category);
    if (!query) return filtered;
    return fuse.search(query).map((result) => result.item).filter((item) => {
      return category === "Toutes" || item.category === category;
    });
  }, [category, items, query, fuse]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`glass-pill px-4 py-2 text-sm font-semibold focus-ring ${
              category === item
                ? "bg-ink text-white border-ink ring-0"
                : "text-ink/70 hover:border-white/80 hover:text-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une demarche" />
      {results.length === 0 ? (
        <p className="text-sm text-slate">Aucun resultat ne correspond a cette recherche.</p>
      ) : (
        <div className="card-grid">
          {results.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col gap-3">
              <h3 className="text-lg font-display">{item.title}</h3>
              <p className="text-xs uppercase text-slate">{item.category}</p>
              <p className="text-sm text-slate flex-1">{item.description}</p>
              <Button href={`/demarches/${item.slug}`} variant="secondary" className="self-start">
                Voir la fiche
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
