import { City } from '../types/weather';

const KEY = 'weather:favorites';

export async function getFavorites(): Promise<City[]> {
  return JSON.parse(localStorage.getItem(KEY) ?? '[]');
}

export async function isFavorite(id: number): Promise<boolean> {
  return (await getFavorites()).some((city) => city.id === id);
}

export async function addFavorite(city: City): Promise<void> {
  const cities: City[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  if (!cities.some((item) => item.id === city.id)) {
    localStorage.setItem(KEY, JSON.stringify([...cities, city]));
  }
}

export async function removeFavorite(id: number): Promise<void> {
  const cities: City[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  localStorage.setItem(KEY, JSON.stringify(cities.filter((city) => city.id !== id)));
}
