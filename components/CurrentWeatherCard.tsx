import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { WeatherMotion } from './WeatherMotion';
import { CurrentWeather, DailyItem } from '../types/weather';
import { formatLongDate } from '../utils/date';
import { usePreferences } from '../hooks/usePreferences';
import { formatTemp } from '../utils/format';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodes';

type Props = {
  current: CurrentWeather;
  reduced: boolean;
  today: DailyItem; // Bugünün günlük verisi (tarih, en yüksek / en düşük)
};

// Anlık hava durumu kartı: tarih, ikon, sıcaklık, açıklama, hissedilen, en yüksek / en düşük
export default function CurrentWeatherCard({ current, today, reduced }: Props) {
  const { unit } = usePreferences();
  // Gündüz açık mavi, gece koyu lacivert kart
  const cardColor = current.isDay ? 'bg-sky-700' : 'bg-indigo-950';
  const softText = current.isDay ? 'text-sky-100' : 'text-indigo-200';

  return (
    <View className={`items-center overflow-hidden rounded-3xl px-4 py-6 ${cardColor}`}>
      <Text className={`text-sm ${softText}`}>{formatLongDate(today.date)}</Text>

      <WeatherMotion reduced={reduced} code={current.weatherCode} isDay={current.isDay}>
        <MaterialCommunityIcons
          name={getWeatherIcon(current.weatherCode, current.isDay)}
          size={96}
          color="white"
        />
      </WeatherMotion>
      <Text className="text-6xl font-bold text-white">{formatTemp(current.temperature, unit)}</Text>
      <Text className="mt-1 text-center text-xl font-semibold text-white">
        {getWeatherDescription(current.weatherCode)}
      </Text>
      <Text className={`mt-1 text-base ${softText}`}>
        Hissedilen {formatTemp(current.feelsLike, unit)}
      </Text>

      {/* Günün en yüksek ve en düşük sıcaklığı */}
      <View className="mt-4 flex-row items-center rounded-full bg-white/20 px-4 py-2">
        <MaterialCommunityIcons name="arrow-up" size={16} color="white" />
        <Text className="ml-1 text-base font-semibold text-white">{formatTemp(today.tempMax, unit)}</Text>
        <MaterialCommunityIcons name="arrow-down" size={16} color="white" style={{ marginLeft: 14 }} />
        <Text className="ml-1 text-base font-semibold text-white">{formatTemp(today.tempMin, unit)}</Text>
      </View>
    </View>
  );
}
