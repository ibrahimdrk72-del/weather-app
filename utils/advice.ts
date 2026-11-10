import type { CurrentWeather, DailyItem } from '../types/weather';

export function weatherAdvice(current: CurrentWeather, today: DailyItem): string[] {
  const advice: string[] = [];
  if (Math.max(current.windSpeed, current.gusts ?? 0, today.maxWind ?? 0) >= 40) {
    advice.push('Kuvvetli rüzgâr bekleniyor. Açık alanlarda dikkatli olun.');
  }
  if ((today.precipitationProbability ?? 0) >= 60 || (today.precipitation ?? 0) >= 3) {
    advice.push('Yağış bekleniyor. Yanınıza şemsiye veya yağmurluk alın.');
  }
  if (Math.min(current.feelsLike, today.tempMin) <= 5) {
    advice.push('Hava soğuk. Dışarı çıkarken kat kat giyinin.');
  }
  if ((today.uv ?? 0) >= 6) {
    advice.push('UV yüksek. Gölgede kalın ve güneş koruyucu kullanın.');
  }
  return advice;
}
