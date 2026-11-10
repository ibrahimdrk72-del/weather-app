import type { City } from '../types/weather';

export const popularCities: City[] = [
  { id: 745044, name: 'İstanbul', country: 'Türkiye', latitude: 41.01384, longitude: 28.94966 },
  { id: 323786, name: 'Ankara', country: 'Türkiye', latitude: 39.91987, longitude: 32.85427 },
  { id: 311046, name: 'İzmir', country: 'Türkiye', latitude: 38.41273, longitude: 27.13838 },
  { id: 323777, name: 'Antalya', country: 'Türkiye', latitude: 36.90812, longitude: 30.69556 },
];

export function parseCity(params: Record<string, unknown>): City | null {
  const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const { id, name, country, latitude, longitude } = params;
  if (typeof id !== 'string' || !/^\d+$/.test(id) ||
      typeof name !== 'string' || !name.trim() ||
      typeof latitude !== 'string' || !decimal.test(latitude.trim()) ||
      typeof longitude !== 'string' || !decimal.test(longitude.trim()) ||
      (country !== undefined && typeof country !== 'string')) return null;

  const city = { id: Number(id), name: name.trim(), country: country ?? '',
    latitude: Number(latitude), longitude: Number(longitude) };
  if (!Number.isSafeInteger(city.id) || city.id <= 0 ||
      !Number.isFinite(city.latitude) || Math.abs(city.latitude) > 90 ||
      !Number.isFinite(city.longitude) || Math.abs(city.longitude) > 180) return null;
  return city;
}
