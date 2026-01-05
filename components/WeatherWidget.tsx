import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun
} from "@phosphor-icons/react";
import type { WeatherSnapshot } from "@/lib/weather";

type WeatherWidgetProps = {
  data: WeatherSnapshot;
};

const formatTemp = (value: number | null) =>
  typeof value === "number" ? `${Math.round(value)}°` : "—";

const resolveLabel = (code: number | null) => {
  if (code === null) return "Conditions";
  if (code <= 1) return "Ensoleille";
  if (code <= 4) return "Nuageux";
  if (code <= 7) return "Couvert";
  if (code >= 10 && code <= 22) return "Pluie";
  if (code >= 30 && code <= 32) return "Brouillard";
  if (code >= 40 && code <= 48) return "Averses";
  if (code >= 60 && code <= 78) return "Neige";
  if (code >= 90) return "Orages";
  return "Conditions";
};

const resolveIcon = (code: number | null) => {
  if (code === null) return Cloud;
  if (code <= 1) return Sun;
  if (code <= 4) return Cloud;
  if (code <= 7) return Cloud;
  if (code >= 10 && code <= 22) return CloudRain;
  if (code >= 30 && code <= 32) return CloudFog;
  if (code >= 40 && code <= 48) return CloudRain;
  if (code >= 60 && code <= 78) return CloudSnow;
  if (code >= 90) return CloudLightning;
  return Cloud;
};

export const WeatherWidget = ({ data }: WeatherWidgetProps) => {
  const Icon = resolveIcon(data.code);
  const label = resolveLabel(data.code);

  return (
    <div className="glass-panel motion-soft w-full sm:max-w-[220px] px-4 py-3 text-ink">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-slate">
        <span>Meteo</span>
        <span className="max-w-[90px] truncate text-right" title={data.location}>
          {data.location}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accentSoft text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <div className="text-2xl font-display">{formatTemp(data.temp)}</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate">{label}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate">
        <span>Min {formatTemp(data.tmin)}</span>
        <span>Max {formatTemp(data.tmax)}</span>
      </div>
    </div>
  );
};
