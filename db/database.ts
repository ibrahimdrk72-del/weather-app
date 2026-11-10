import * as SQLite from 'expo-sqlite';

// Veritabanı bağlantısı bir kez açılır ve herkes aynı bağlantıyı kullanır.
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Veritabanını açar ve tablo yoksa oluşturur
async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  // "weather.db" dosyası telefonun içinde, uygulamaya özel alanda saklanır
  const db = await SQLite.openDatabaseAsync('weather.db');

  // id PRIMARY KEY olduğu için aynı şehir ikinci kez eklenemez
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    return db;
  } catch (error) {
    await db.closeAsync().catch(() => undefined);
    throw error;
  }
}

// Açık bağlantıyı döndürür (ilk çağrıda açar)
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}
