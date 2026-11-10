import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { DailyItem } from '../types/weather';
import { getDayName } from '../utils/date';
import { formatTemp } from '../utils/format';
import { getWeatherIcon } from '../utils/weatherCodes';

type Props = {
  days: DailyItem[];
};

// Yağış olasılığı bu değerin altındaysa gösterilmez
const MIN_RAIN_PERCENT = 20;

// 7 günlük tahmin: gün adı, ikon, yağış olasılığı, en düşük / en yüksek sıcaklık ve aralık çubuğu
export default function DailyForecast({ days }: Props) {
  // Haftanın en soğuk ve en sıcak değeri: çubukların ortak ölçeği
  const weekMin = Math.min(...days.map((day) => day.tempMin));
  const weekMax = Math.max(...days.map((day) => day.tempMax));
  const range = weekMax - weekMin || 1; // 0'a bölmeyi önle

  return (
    <View className="mt-4 rounded-3xl bg-white p-4">
      <Text className="mb-1 text-base font-semibold text-slate-800">7 Günlük Tahmin</Text>
      {days.map((day, index) => {
        // Çubuğun başlangıcı ve genişliği (haftalık aralığa göre yüzde olarak)
        const left = ((day.tempMin - weekMin) / range) * 100;
        const width = Math.max(((day.tempMax - day.tempMin) / range) * 100, 8);
        const isLast = index === days.length - 1;

        return (
          <View
            key={day.date}
            className={`flex-row items-center py-3 ${isLast ? '' : 'border-b border-slate-100'}`}
          >
            <Text numberOfLines={1} className="flex-1 text-base text-slate-700">
              {getDayName(day.date, index)}
            </Text>

            {/* Yağış olasılığı (düşükse boş) */}
            <Text className="w-9 text-right text-xs font-semibold text-sky-600">
              {day.precipitationProbability >= MIN_RAIN_PERCENT ? `%${day.precipitationProbability}` : ''}
            </Text>
            <MaterialCommunityIcons
              name={getWeatherIcon(day.weatherCode)}
              size={24}
              color="#0284c7"
              style={{ marginHorizontal: 6 }}
            />

            {/* En düşük - çubuk - en yüksek */}
            <Text className="w-8 text-right text-base text-slate-400">{formatTemp(day.tempMin)}</Text>
            <View className="mx-2 h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
              <View
                className="h-1.5 rounded-full bg-sky-400"
                style={{ marginLeft: `${Math.min(left, 92)}%`, width: `${width}%` }}
              />
            </View>
            <Text className="w-8 text-base font-semibold text-slate-800">
              {formatTemp(day.tempMax)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
