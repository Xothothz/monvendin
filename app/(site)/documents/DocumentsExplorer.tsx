"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { DocumentItem } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { SearchInput } from "@/components/SearchInput";
import { formatDate } from "@/lib/data";

const options = {
  keys: ["title", "type", "source"],
  threshold: 0.3
};

type DocumentsExplorerProps = {
  items: DocumentItem[];
};

export const DocumentsExplorer = ({ items }: DocumentsExplorerProps) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Tous");
  const [year, setYear] = useState("Toutes");

  const types = useMemo(() => {
    const set = new Set(items.map((item) => item.type));
    return ["Tous", ...Array.from(set)];
  }, [items]);

  const years = useMemo(() => {
    const set = new Set(items.map((item) => String(item.year)));
    return ["Toutes", ...Array.from(set).sort((a, b) => Number(b) - Number(a))];
  }, [items]);

  const fuse = useMemo(() => new Fuse(items, options), [items]);

  const results = useMemo(() => {
    let filtered = items;
    if (type !== "Tous") {
      filtered = filtered.filter((item) => item.type === type);
    }
    if (year !== "Toutes") {
      filtered = filtered.filter((item) => String(item.year) === year);
    }
    if (!query) return filtered;
    return fuse.search(query).map((result) => result.item).filter((item) => {
      if (type !== "Tous" && item.type !== type) return false;
      if (year !== "Toutes" && String(item.year) !== year) return false;
      return true;
    });
  }, [items, query, type, year, fuse]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3 glass-panel p-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un document" />
        <label className="text-sm">
          <span className="text-slate">Type</span>
          <select
            className="mt-1 w-full glass-select"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {types.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate">Annee</span>
          <select
            className="mt-1 w-full glass-select"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      {results.length === 0 ? (
        <p className="text-sm text-slate">Aucun document ne correspond a cette recherche.</p>
      ) : (
        <div className="card-grid">
          {results.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge variant="accent">{item.type}</Badge>
                <span className="text-xs text-slate">{item.year}</span>
              </div>
              <h3 className="text-lg font-display">{item.title}</h3>
              <p className="text-sm text-slate">Date: {formatDate(item.date)}</p>
              <p className="text-sm text-slate">Source: {item.source}</p>
              <Button href={item.url} variant="secondary" className="self-start">
                Telecharger
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
