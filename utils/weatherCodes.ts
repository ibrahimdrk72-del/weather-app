import { MaterialCommunityIcons } from '@expo/vector-icons';

// İkon adının tipi: sadece MaterialCommunityIcons içinde var olan adlar yazılabilir
export type WeatherIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type WeatherInfo = {
  description: string; // Türkçe açıklama
  dayIcon: WeatherIconName; // Gündüz ikonu
  nightIcon: WeatherIconName; // Gece ikonu
};

// WMO hava durumu kodları -> Türkçe açıklama ve ikon tablosu.
// Open-Meteo "weather_code" alanında bu kodları gönderir.
const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: { description: 'Açık', dayIcon: 'weather-sunny', nightIcon: 'weather-night' },
  1: { description: 'Az bulutlu', dayIcon: 'weather-partly-cloudy', nightIcon: 'weather-night-partly-cloudy' },
  2: { description: 'Parçalı bulutlu', dayIcon: 'weather-partly-cloudy', nightIcon: 'weather-night-partly-cloudy' },
  3: { description: 'Kapalı', dayIcon: 'weather-cloudy', nightIcon: 'weather-cloudy' },
  45: { description: 'Sisli', dayIcon: 'weather-fog', nightIcon: 'weather-fog' },
  48: { description: 'Kırağılı sis', dayIcon: 'weather-fog', nightIcon: 'weather-fog' },
  51: { description: 'Hafif çisenti', dayIcon: 'weather-partly-rainy', nightIcon: 'weather-rainy' },
  53: { description: 'Çisenti', dayIcon: 'weather-rainy', nightIcon: 'weather-rainy' },
  55: { description: 'Yoğun çisenti', dayIcon: 'weather-rainy', nightIcon: 'weather-rainy' },
  56: { description: 'Dondurucu çisenti', dayIcon: 'weather-snowy-rainy', nightIcon: 'weather-snowy-rainy' },
  57: { description: 'Yoğun dondurucu çisenti', dayIcon: 'weather-snowy-rainy', nightIcon: 'weather-snowy-rainy' },
  61: { description: 'Hafif yağmurlu', dayIcon: 'weather-partly-rainy', nightIcon: 'weather-rainy' },
  63: { description: 'Yağmurlu', dayIcon: 'weather-rainy', nightIcon: 'weather-rainy' },
  65: { description: 'Şiddetli yağmurlu', dayIcon: 'weather-pouring', nightIcon: 'weather-pouring' },
  66: { description: 'Dondurucu yağmur', dayIcon: 'weather-snowy-rainy', nightIcon: 'weather-snowy-rainy' },
  67: { description: 'Şiddetli dondurucu yağmur', dayIcon: 'weather-snowy-rainy', nightIcon: 'weather-snowy-rainy' },
  71: { description: 'Hafif kar yağışlı', dayIcon: 'weather-snowy', nightIcon: 'weather-snowy' },
  73: { description: 'Kar yağışlı', dayIcon: 'weather-snowy', nightIcon: 'weather-snowy' },
  75: { description: 'Yoğun kar yağışlı', dayIcon: 'weather-snowy-heavy', nightIcon: 'weather-snowy-heavy' },
  77: { description: 'Kar taneleri', dayIcon: 'weather-snowy', nightIcon: 'weather-snowy' },
  80: { description: 'Hafif sağanak', dayIcon: 'weather-partly-rainy', nightIcon: 'weather-rainy' },
  81: { description: 'Sağanak yağışlı', dayIcon: 'weather-pouring', nightIcon: 'weather-pouring' },
  82: { description: 'Şiddetli sağanak', dayIcon: 'weather-pouring', nightIcon: 'weather-pouring' },
  85: { description: 'Hafif kar sağanağı', dayIcon: 'weather-snowy', nightIcon: 'weather-snowy' },
  86: { description: 'Yoğun kar sağanağı', dayIcon: 'weather-snowy-heavy', nightIcon: 'weather-snowy-heavy' },
  95: { description: 'Gök gürültülü fırtına', dayIcon: 'weather-lightning', nightIcon: 'weather-lightning' },
  96: { description: 'Dolu ile fırtına', dayIcon: 'weather-hail', nightIcon: 'weather-hail' },
  99: { description: 'Şiddetli dolu ile fırtına', dayIcon: 'weather-hail', nightIcon: 'weather-hail' },
};

// Tabloda olmayan bir kod gelirse kullanılacak varsayılan değer
const UNKNOWN: WeatherInfo = {
  description: 'Bilinmiyor',
  dayIcon: 'weather-cloudy',
  nightIcon: 'weather-cloudy',
};

// Kodun Türkçe açıklamasını döndürür. Örn. 0 -> "Açık"
export function getWeatherDescription(code: number): string {
  return (WEATHER_CODES[code] ?? UNKNOWN).description;
}

// Kodun ikon adını döndürür. Gece ise gece ikonunu seçer.
export function getWeatherIcon(code: number, isDay: boolean = true): WeatherIconName {
  const info = WEATHER_CODES[code] ?? UNKNOWN;
  return isDay ? info.dayIcon : info.nightIcon;
}
