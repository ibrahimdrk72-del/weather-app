// Uygulamada kullanılan tüm veri tipleri bu dosyada toplanır.

// Arama sonucunda gelen veya favorilere kaydedilen şehir
export type City = {
  id: number; // Open-Meteo'nun şehre verdiği benzersiz numara
  name: string;
  country: string; // Ülke adı (yoksa boş metin)
  admin1?: string; // İl / bölge adı (örn. "Ege Bölgesi")
  latitude: number; // Enlem
  longitude: number; // Boylam
};

// Anlık hava durumu
export type CurrentWeather = {
  temperature: number; // °C
  feelsLike: number; // Hissedilen sıcaklık (°C)
  humidity: number; // Nem (%)
  windSpeed: number; // Rüzgar hızı (km/s)
  weatherCode: number; // WMO hava durumu kodu
  isDay: boolean; // Gündüz mü?
};

// Saatlik tahmindeki tek bir saat
export type HourlyItem = {
  time: string; // Örn. "2026-11-10T14:00"
  temperature: number;
  weatherCode: number;
  isDay: boolean;
};

// Günlük tahmindeki tek bir gün
export type DailyItem = {
  date: string; // Örn. "2026-11-10"
  weatherCode: number;
  tempMax: number;
  tempMin: number;
};

// Bir konumun ekranda gösterilen bütün hava durumu verisi
export type WeatherData = {
  current: CurrentWeather;
  hourly: HourlyItem[]; // Önümüzdeki 24 saat
  daily: DailyItem[]; // 7 gün
};

// Favoriler ekranında gösterilen anlık özet (şehir id -> değer eşlemesinde kullanılır)
export type CurrentSummary = {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
};
