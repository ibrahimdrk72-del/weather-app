import { City } from '../types/weather';
import { getDatabase } from './database';

// Favori şehirlerle ilgili tüm veritabanı işlemleri bu dosyadadır.
// Sorgulardaki "?" işaretleri parametredir: değerler SQL metnine yapıştırılmaz,
// ayrı gönderilir. Böylece SQL injection (SQL enjeksiyonu) riski olmaz.

// Tüm favorileri getirir (ilk eklenen en üstte)
export async function getFavorites(): Promise<City[]> {
  const db = await getDatabase();
  return db.getAllAsync<City>(
    'SELECT id, name, country, latitude, longitude FROM favorites ORDER BY created_at ASC'
  );
}

// Şehir favorilerde mi?
export async function isFavorite(id: number): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM favorites WHERE id = ?', [id]);
  return row !== null;
}

// Şehri favorilere ekler. "OR IGNORE": şehir zaten kayıtlıysa hata vermeden atlar.
export async function addFavorite(city: City): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO favorites (id, name, country, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [city.id, city.name, city.country, city.latitude, city.longitude, Date.now()]
  );
}

// Şehri favorilerden siler
export async function removeFavorite(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM favorites WHERE id = ?', [id]);
}
