"use client";

import { Tabs } from "@/components/Tabs";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { DocumentItem } from "@/lib/data";

const groupByType = (items: DocumentItem[]) => {
  const map = new Map<string, DocumentItem[]>();
  items.forEach((item) => {
    const bucket = map.get(item.type) ?? [];
    bucket.push(item);
    map.set(item.type, bucket);
  });
  return map;
};

type VieMunicipaleTabsProps = {
  items: DocumentItem[];
};

export const VieMunicipaleTabs = ({ items }: VieMunicipaleTabsProps) => {
  const groups = groupByType(items);
  const tabItems = Array.from(groups.entries()).map(([type, docs]) => ({
    id: type,
    label: type,
    content: (
      <div className="card-grid">
        {docs.map((doc) => (
          <Card key={doc.id} className="p-6 flex flex-col gap-3">
            <h3 className="text-lg font-display">{doc.title}</h3>
            <p className="text-sm text-slate">{doc.type} - {doc.year}</p>
            <Button href={doc.url} variant="secondary" className="self-start">
              Consulter
            </Button>
          </Card>
        ))}
      </div>
    )
  }));

  return <Tabs items={tabItems} initialId={tabItems[0]?.id} />;
};
