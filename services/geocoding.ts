import { City } from '../types/weather';
import { fetchJson } from './http';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// API'den gelen ham JSON'un bizim kullandığımız kısmı
type GeocodingResponse = {
  // Sonuç yoksa "results" alanı hiç gelmez
  results?: {
    id: number;
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }[];
};

// Yazılan metne göre şehir arar. Sonuç yoksa boş dizi döner.
export async function searchCities(query: string): Promise<City[]> {
  // encodeURIComponent: boşluk ve Türkçe karakterleri URL'e uygun hale getirir
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=10&language=tr&format=json`;
  const data = await fetchJson<GeocodingResponse>(url);

  return (data.results ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    country: item.country ?? '',
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}
