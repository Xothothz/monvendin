"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowSquareOut,
  Clock,
  Leaf,
  Recycle,
  Trash,
  Wine
} from "@phosphor-icons/react";
import { Card } from "@/components/Card";

type ScheduleCard = {
  title: string;
  badge: string;
  badgeClass: string;
  icon: "trash" | "recycle" | "leaf" | "wine";
  day: string;
  time: string;
  frequency: string;
  image?: string;
};

type DechetsScheduleProps = {
  cards: ScheduleCard[];
};

const iconMap = {
  trash: Trash,
  recycle: Recycle,
  leaf: Leaf,
  wine: Wine
};

export const DechetsSchedule = ({ cards }: DechetsScheduleProps) => {
  const [activeCard, setActiveCard] = useState<ScheduleCard | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!activeCard) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCard(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeCard]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => item.image && setActiveCard(item)}
              className="text-left"
              aria-label={
                item.image ? `Voir le visuel ${item.title}` : `Informations ${item.title}`
              }
            >
              <Card className={`p-5 space-y-3 ${item.image ? "cursor-pointer" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${item.badgeClass}`}
                  >
                    {item.badge}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="text-lg font-display text-ink">{item.title}</h3>
                <div className="space-y-1 text-sm text-slate">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>{item.day}</span>
                  </p>
                  <p>{item.time}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/60">
                    {item.frequency}
                  </p>
                </div>
                {item.image ? (
                  <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/80">
                    <ArrowSquareOut className="h-3 w-3" aria-hidden="true" />
                    Voir le visuel
                  </div>
                ) : null}
              </Card>
            </button>
          );
        })}
      </div>

      {activeCard?.image && isMounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Visuel ${activeCard.title}`}
              className="fixed inset-0 z-[2147483647] bg-ink/70 backdrop-blur-sm"
              onClick={() => setActiveCard(null)}
            >
              <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
                <div
                  className="relative flex items-center justify-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActiveCard(null)}
                    className="absolute right-3 top-3 z-[2147483648] rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card"
                  >
                    Fermer
                  </button>
                  <img
                    src={activeCard.image}
                    alt={`Visuel ${activeCard.title}`}
                    className="max-h-[85vh] w-auto max-w-[90vw] object-contain block"
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};
