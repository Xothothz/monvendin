"use client";

import { useState } from "react";
import clsx from "clsx";

type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
  initialId?: string;
};

export const Tabs = ({ items, initialId }: TabsProps) => {
  const firstId = initialId ?? items[0]?.id;
  const [active, setActive] = useState(firstId);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide border transition focus-ring",
              active === tab.id
                ? "bg-accent text-white border-accent shadow-card"
                : "bg-white text-ink border-ink/10 hover:border-ink/20"
            )}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{items.find((tab) => tab.id === active)?.content}</div>
    </div>
  );
};
