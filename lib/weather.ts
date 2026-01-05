type WeatherSnapshot = {
  location: string;
  temp: number | null;
  tmin: number | null;
  tmax: number | null;
  code: number | null;
  updatedAt: string;
};

type ForecastDailyItem = {
  tmin?: number;
  tmax?: number;
  weather?: number;
};

type ForecastHourlyItem = {
  temp2m?: number;
  weather?: number;
};

const LOCATION = {
  name: "Vendin-les-Bethune",
  lat: 50.533,
  lon: 2.867
};

const CACHE_TTL_MS = 30 * 60 * 1000;
let cachedWeather: { data: WeatherSnapshot; expiresAt: number } | null = null;

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const buildUrl = (path: string, token: string) => {
  const url = new URL(`https://api.meteo-concept.com/api/${path}`);
  url.searchParams.set("token", token);
  url.searchParams.set("latlng", `${LOCATION.lat},${LOCATION.lon}`);
  return url.toString();
};

export const getWeatherSnapshot = async (): Promise<WeatherSnapshot | null> => {
  const token = process.env.METEO_CONCEPT_API_KEY;
  if (!token) return null;

  const now = Date.now();
  if (cachedWeather && cachedWeather.expiresAt > now) {
    return cachedWeather.data;
  }

  const [dailyResult, hourlyResult] = await Promise.allSettled([
    fetch(buildUrl("forecast/daily", token)),
    fetch(buildUrl("forecast/nextHours", token))
  ]);

  let dailyItem: ForecastDailyItem | null = null;
  if (dailyResult.status === "fulfilled" && dailyResult.value.ok) {
    try {
      const dailyJson = (await dailyResult.value.json()) as {
        forecast?: ForecastDailyItem[];
      };
      dailyItem = dailyJson.forecast?.[0] ?? null;
    } catch {
      dailyItem = null;
    }
  }

  let hourlyItem: ForecastHourlyItem | null = null;
  if (hourlyResult.status === "fulfilled" && hourlyResult.value.ok) {
    try {
      const hourlyJson = (await hourlyResult.value.json()) as {
        forecast?: ForecastHourlyItem[];
      };
      hourlyItem = hourlyJson.forecast?.[0] ?? null;
    } catch {
      hourlyItem = null;
    }
  }

  const temp = toNumber(hourlyItem?.temp2m);
  const tmin = toNumber(dailyItem?.tmin);
  const tmax = toNumber(dailyItem?.tmax);
  const code = toNumber(hourlyItem?.weather ?? dailyItem?.weather);

  if (temp === null && tmin === null && tmax === null && code === null) {
    return null;
  }

  const snapshot: WeatherSnapshot = {
    location: LOCATION.name,
    temp,
    tmin,
    tmax,
    code,
    updatedAt: new Date().toISOString()
  };

  cachedWeather = {
    data: snapshot,
    expiresAt: now + CACHE_TTL_MS
  };

  return snapshot;
};

export type { WeatherSnapshot };
