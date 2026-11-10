import type { WeatherData } from '../types/weather';

export const CACHE_TTL = 24 * 60 * 60 * 1000;

export type CachedForecast = { data: WeatherData; savedAt: number };

export function parseCachedForecast(raw: string | null, now: number): CachedForecast | null {
  if (!raw) return null;
  try {
    const entry: CachedForecast = JSON.parse(raw);
    if (typeof entry?.savedAt === 'number' && Number.isFinite(entry.savedAt) && entry.savedAt <= now && now - entry.savedAt < CACHE_TTL &&
        entry.data?.current && entry.data.hourly?.length && entry.data.daily?.length) {
      return entry;
    }
  } catch {
    // An invalid entry is treated as a cache miss.
  }
  return null;
}
