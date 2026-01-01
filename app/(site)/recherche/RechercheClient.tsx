"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { demarches, documents } from "@/lib/data";
import { Card } from "@/components/Card";
import { SearchInput } from "@/components/SearchInput";

const dataset = [
  ...demarches.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.description,
    type: "Demarche",
    href: `/demarches/${item.slug}`
  })),
  ...documents.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.source,
    type: "Document",
    href: item.url
  }))
];

const options = {
  keys: ["title", "summary", "type"],
  threshold: 0.35
};

export const RechercheClient = () => {
  const [query, setQuery] = useState("");
  const fuse = useMemo(() => new Fuse(dataset, options), []);
  const results = query ? fuse.search(query).map((result) => result.item) : dataset;

  return (
    <div className="space-y-6">
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un contenu" />
      {results.length === 0 ? (
        <p className="text-sm text-slate">Aucun resultat ne correspond a cette recherche.</p>
      ) : (
        <div className="grid gap-4">
          {results.map((item) => (
            <Card key={item.id} className="p-4 flex flex-col gap-2">
              <p className="text-xs uppercase text-slate">{item.type}</p>
              <a href={item.href} className="text-lg font-display">
                {item.title}
              </a>
              <p className="text-sm text-slate">{item.summary}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
