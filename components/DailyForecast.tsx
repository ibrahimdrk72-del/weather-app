import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { DailyItem } from '../types/weather';
import { getDayName } from '../utils/date';
import { formatTemp } from '../utils/format';
import { getWeatherIcon } from '../utils/weatherCodes';

type Props = {
  days: DailyItem[];
};

// 7 günlük tahmin: gün adı, ikon, en yüksek / en düşük sıcaklık
export default function DailyForecast({ days }: Props) {
  return (
    <View className="mt-4 rounded-3xl bg-white p-4">
      <Text className="mb-1 text-base font-semibold text-slate-800">7 Günlük Tahmin</Text>
      {days.map((day, index) => (
        <View key={day.date} className="flex-row items-center border-b border-slate-100 py-3">
          <Text className="flex-1 text-base text-slate-700">{getDayName(day.date, index)}</Text>
          <MaterialCommunityIcons name={getWeatherIcon(day.weatherCode)} size={26} color="#0284c7" />
          {/* Sabit genişlik: sıcaklıklar alt alta hizalı dursun */}
          <Text className="w-12 text-right text-base font-semibold text-slate-800">
            {formatTemp(day.tempMax)}
          </Text>
          <Text className="w-12 text-right text-base text-slate-400">{formatTemp(day.tempMin)}</Text>
        </View>
      ))}
    </View>
  );
}
