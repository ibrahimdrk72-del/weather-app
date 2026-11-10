import { City, CurrentSummary, WeatherData } from '../types/weather';
import { fetchJson } from './http';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// API'den gelen ham JSON'un bizim kullandığımız kısmı.
// Open-Meteo saatlik ve günlük verileri "paralel diziler" halinde gönderir:
// hourly.time[3] ile hourly.temperature_2m[3] aynı saate aittir.
type ForecastResponse = {
  current: {
    time: string; // Şehrin yerel saati, örn. "2026-11-10T14:15"
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number; // 1 = gündüz, 0 = gece
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
    precipitation_probability: (number | null)[]; // Bazı saatlerde veri olmayabilir (null)
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    sunrise: string[];
    sunset: string[];
  };
};

// Verilen enlem/boylam için anlık, saatlik (24 saat) ve günlük (7 gün) hava durumunu getirir.
export async function getWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day' +
    '&hourly=temperature_2m,weather_code,is_day,precipitation_probability' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset' +
    '&forecast_days=7' + // 7 günlük veri iste
    '&timezone=auto'; // saatler şehrin kendi saat diliminde gelsin

  const data = await fetchJson<ForecastResponse>(url);

  // Beklenen alanlar gelmediyse ekran çökmesin diye anlaşılır bir hata ver
  if (!data.current || !data.hourly?.time?.length || !data.daily?.time?.length) {
    throw new Error('Hava durumu verisi eksik geldi. Lütfen daha sonra tekrar deneyin.');
  }

  // Saatlik veri günün 00:00'ından başlar. Biz şu anki saatten itibaren 24 saati istiyoruz.
  // "2026-11-10T14:15" -> "2026-11-10T14" (saat kısmına kadar) ile başlayan ilk kaydı bul.
  const currentHour = data.current.time.slice(0, 13);
  const startIndex = Math.max(
    0,
    data.hourly.time.findIndex((time) => time.startsWith(currentHour))
  );

  // Ham JSON'u ekranların kullandığı sade tipe çeviriyoruz
  return {
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    // Paralel dizileri tek tek nesnelere dönüştür, sonra 24 saatlik dilimi al
    hourly: data.hourly.time
      .map((time, i) => ({
        time,
        temperature: data.hourly.temperature_2m[i],
        weatherCode: data.hourly.weather_code[i],
        isDay: data.hourly.is_day[i] === 1,
        precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
      }))
      .slice(startIndex, startIndex + 24),
    daily: data.daily.time.map((date, i) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
    })),
  };
}

// Favoriler ekranı için: birden fazla şehrin anlık sıcaklığını TEK istekle getirir.
// Sonuç: { şehirId: { temperature, weatherCode, isDay } }
export async function getCurrentSummaries(cities: City[]): Promise<Record<number, CurrentSummary>> {
  if (cities.length === 0) return {};

  // Open-Meteo virgülle ayrılmış birden fazla koordinat kabul eder
  const latitudes = cities.map((c) => c.latitude).join(',');
  const longitudes = cities.map((c) => c.longitude).join(',');
  const url =
    `${FORECAST_URL}?latitude=${latitudes}&longitude=${longitudes}` +
    '&current=temperature_2m,weather_code,is_day&timezone=auto';

  type Item = { current: { temperature_2m: number; weather_code: number; is_day: number } };
  const data = await fetchJson<Item | Item[]>(url);

  // Tek şehir gönderilince nesne, birden fazla gönderilince dizi döner; ikisini de diziye çevir
  const list = Array.isArray(data) ? data : [data];

  // Cevaplar gönderdiğimiz şehirlerle aynı sırada gelir
  const result: Record<number, CurrentSummary> = {};
  cities.forEach((city, i) => {
    const current = list[i]?.current;
    if (!current) return; // Bu şehrin verisi gelmediyse atla (ekranda "--" görünür)
    result[city.id] = {
      temperature: current.temperature_2m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
    };
  });
  return result;
}
