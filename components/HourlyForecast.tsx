import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Text, View } from 'react-native';

import { HourlyItem } from '../types/weather';
import { formatHour } from '../utils/date';
import { usePreferences } from '../hooks/usePreferences';
import { formatTemp } from '../utils/format';
import { getWeatherIcon } from '../utils/weatherCodes';
import TemperatureChart from './TemperatureChart';

type Props = {
  hours: HourlyItem[];
};

// Yağış olasılığı bu değerin altındaysa gösterilmez (ekran sade kalsın)
const MIN_RAIN_PERCENT = 20;

// Saatlik tahmin: önümüzdeki 24 saat, yatay kaydırılabilir liste
export default function HourlyForecast({ hours }: Props) {
  const { unit } = usePreferences();
  return (
    <View className="mt-2.5 rounded-3xl bg-white dark:bg-slate-900 py-4">
      <Text className="mb-3 px-4 text-base font-semibold text-slate-800 dark:text-slate-100">Saatlik Tahmin</Text>
      <TemperatureChart hours={hours} />

      <FlatList
        horizontal
        data={hours}
        keyExtractor={(item) => item.time}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item, index }) => (
          // İlk kutu ("Şimdi") açık mavi arka planla vurgulanır
          <View className={`w-16 items-center rounded-2xl py-2 ${index === 0 ? 'bg-sky-100 dark:bg-sky-950' : ''}`}>
            <Text className="text-sm text-slate-500 dark:text-slate-300">{formatHour(item.time, index)}</Text>
            <MaterialCommunityIcons
              name={getWeatherIcon(item.weatherCode, item.isDay)}
              size={28}
              color="#0284c7"
              style={{ marginVertical: 6 }}
            />
            <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {formatTemp(item.temperature, unit)}
            </Text>
            {/* Yağış olasılığı; düşükse boş bırakılır ama satır yüksekliği korunur */}
            <Text className="mt-0.5 text-xs font-semibold text-sky-600">
              {(item.precipitationProbability ?? -1) >= MIN_RAIN_PERCENT
                ? `%${item.precipitationProbability}`
                : item.precipitationProbability == null ? '—' : ' '}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
