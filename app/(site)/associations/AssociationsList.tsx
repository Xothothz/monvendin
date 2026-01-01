"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { AssociationItem } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SearchInput } from "@/components/SearchInput";

const options = {
  keys: ["name", "description", "category"],
  threshold: 0.35
};

type AssociationsListProps = {
  items: AssociationItem[];
};

export const AssociationsList = ({ items }: AssociationsListProps) => {
  const [query, setQuery] = useState("");
  const fuse = useMemo(() => new Fuse(items, options), [items]);

  const results = query ? fuse.search(query).map((result) => result.item) : items;

  return (
    <div className="space-y-6">
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une association" />
      {results.length === 0 ? (
        <p className="text-sm text-slate">Aucune association ne correspond a cette recherche.</p>
      ) : (
        <div className="card-grid">
          {results.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col gap-3">
              <h3 className="text-lg font-display">{item.name}</h3>
              <p className="text-xs uppercase text-slate">{item.category}</p>
              <p className="text-sm text-slate flex-1">{item.description}</p>
              <Button href={`/associations/${item.slug}`} variant="secondary" className="self-start">
                Voir la fiche
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
