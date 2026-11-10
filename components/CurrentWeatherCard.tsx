import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { CurrentWeather } from '../types/weather';
import { formatLongDate } from '../utils/date';
import { formatTemp } from '../utils/format';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodes';

type Props = {
  current: CurrentWeather;
  date: string; // Bugünün tarihi, örn. "2026-11-10"
};

// Anlık hava durumu kartı: ikon, sıcaklık, açıklama, hissedilen, nem ve rüzgar
export default function CurrentWeatherCard({ current, date }: Props) {
  return (
    <View className="items-center rounded-3xl bg-sky-500 p-6">
      <Text className="text-sm text-sky-100">{formatLongDate(date)}</Text>

      <MaterialCommunityIcons
        name={getWeatherIcon(current.weatherCode, current.isDay)}
        size={96}
        color="white"
      />
      <Text className="text-7xl font-bold text-white">{formatTemp(current.temperature)}C</Text>
      <Text className="mt-1 text-xl text-white">{getWeatherDescription(current.weatherCode)}</Text>
      <Text className="mt-1 text-base text-sky-100">
        Hissedilen: {formatTemp(current.feelsLike)}C
      </Text>

      {/* Alt satır: nem ve rüzgar */}
      <View className="mt-5 w-full flex-row justify-around border-t border-sky-400 pt-4">
        <View className="items-center">
          <MaterialCommunityIcons name="water-percent" size={24} color="white" />
          <Text className="mt-1 text-base font-semibold text-white">%{current.humidity}</Text>
          <Text className="text-xs text-sky-100">Nem</Text>
        </View>
        <View className="items-center">
          <MaterialCommunityIcons name="weather-windy" size={24} color="white" />
          <Text className="mt-1 text-base font-semibold text-white">
            {Math.round(current.windSpeed)} km/s
          </Text>
          <Text className="text-xs text-sky-100">Rüzgar</Text>
        </View>
      </View>
    </View>
  );
}
