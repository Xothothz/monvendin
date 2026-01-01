"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";

type AgendaEvent = {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
};

type AgendaCalendarProps = {
  events: AgendaEvent[];
};

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export const AgendaCalendar = ({ events }: AgendaCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const preparedEvents = useMemo(
    () =>
      events.map((event) => {
        const start = new Date(event.startDate);
        const end = event.endDate ? new Date(event.endDate) : start;
        return {
          ...event,
          start,
          end,
          startKey: toDateKey(start),
          endKey: toDateKey(end)
        };
      }),
    [events]
  );

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const offset = (startOfMonth.getDay() + 6) % 7;
    const totalCells = Math.ceil((offset + endOfMonth.getDate()) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - offset + 1;
      if (dayNumber < 1 || dayNumber > endOfMonth.getDate()) {
        return null;
      }

      return new Date(year, month, dayNumber);
    });
  }, [currentMonth]);

  const monthLabel = formatMonthLabel(currentMonth);
  const todayKey = toDateKey(new Date());
  const monthStartKey = toDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
  const monthEndKey = toDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));

  const monthEvents = preparedEvents
    .filter((event) => event.startKey <= monthEndKey && event.endKey >= monthStartKey)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate">Calendrier</p>
          <h2 className="text-2xl font-display">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:bg-goldSoft"
            onClick={() =>
              setCurrentMonth(
                (value) => new Date(value.getFullYear(), value.getMonth() - 1, 1)
              )
            }
          >
            Mois precedent
          </button>
          <button
            type="button"
            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink/70 hover:bg-goldSoft"
            onClick={() =>
              setCurrentMonth(
                (value) => new Date(value.getFullYear(), value.getMonth() + 1, 1)
              )
            }
          >
            Mois suivant
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-card">
        <div className="grid grid-cols-7 gap-2 text-[11px] uppercase tracking-widest text-slate">
          {weekDays.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-24 rounded-xl bg-fog/40" />;
            }

            const dayKey = toDateKey(day);
            const dayEvents = preparedEvents.filter(
              (event) => dayKey >= event.startKey && dayKey <= event.endKey
            );

            return (
              <div
                key={dayKey}
                className={clsx(
                  "rounded-xl border border-ink/10 bg-white p-3 min-h-24 flex flex-col gap-2",
                  dayKey === todayKey && "border-accent/60 shadow-card"
                )}
              >
                <div className="flex items-center justify-between text-xs text-slate">
                  <span className="font-semibold text-ink">{day.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <span className="rounded-full bg-goldSoft px-2 py-0.5 text-[10px] font-semibold text-ink">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      href={`/agenda/${event.slug}`}
                      className="flex items-start gap-2 text-[11px] text-ink hover:text-accent"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                      <span className="truncate">{event.title}</span>
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[11px] text-slate">
                      +{dayEvents.length - 2} autres
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-display">Evenements du mois</h3>
        {monthEvents.length === 0 ? (
          <p className="text-sm text-slate">Aucun evenement programme pour cette periode.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {monthEvents.map((event) => (
              <Link
                key={event.id}
                href={`/agenda/${event.slug}`}
                className="rounded-xl border border-ink/10 bg-white p-4 shadow-card transition hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-widest text-slate">
                  {formatDateTime(event.startDate)}
                </p>
                <h4 className="mt-1 text-base font-display text-ink">{event.title}</h4>
                {event.location && <p className="text-xs text-slate">{event.location}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
