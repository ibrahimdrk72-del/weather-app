import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Text, View } from 'react-native';

import { HourlyItem } from '../types/weather';
import { formatHour } from '../utils/date';
import { formatTemp } from '../utils/format';
import { getWeatherIcon } from '../utils/weatherCodes';

type Props = {
  hours: HourlyItem[];
};

// Yağış olasılığı bu değerin altındaysa gösterilmez (ekran sade kalsın)
const MIN_RAIN_PERCENT = 20;

// Saatlik tahmin: önümüzdeki 24 saat, yatay kaydırılabilir liste
export default function HourlyForecast({ hours }: Props) {
  return (
    <View className="mt-2.5 rounded-3xl bg-white py-4">
      <Text className="mb-3 px-4 text-base font-semibold text-slate-800">Saatlik Tahmin</Text>
      <FlatList
        horizontal
        data={hours}
        keyExtractor={(item) => item.time}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item, index }) => (
          // İlk kutu ("Şimdi") açık mavi arka planla vurgulanır
          <View className={`w-16 items-center rounded-2xl py-2 ${index === 0 ? 'bg-sky-100' : ''}`}>
            <Text className="text-sm text-slate-500">{formatHour(item.time, index)}</Text>
            <MaterialCommunityIcons
              name={getWeatherIcon(item.weatherCode, item.isDay)}
              size={28}
              color="#0284c7"
              style={{ marginVertical: 6 }}
            />
            <Text className="text-base font-semibold text-slate-800">
              {formatTemp(item.temperature)}
            </Text>
            {/* Yağış olasılığı; düşükse boş bırakılır ama satır yüksekliği korunur */}
            <Text className="mt-0.5 text-xs font-semibold text-sky-600">
              {item.precipitationProbability >= MIN_RAIN_PERCENT
                ? `%${item.precipitationProbability}`
                : ' '}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
