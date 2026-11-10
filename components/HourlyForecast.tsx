import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Text, View } from 'react-native';

import { HourlyItem } from '../types/weather';
import { formatHour } from '../utils/date';
import { formatTemp } from '../utils/format';
import { getWeatherIcon } from '../utils/weatherCodes';

type Props = {
  hours: HourlyItem[];
};

// Saatlik tahmin: önümüzdeki 24 saat, yatay kaydırılabilir liste
export default function HourlyForecast({ hours }: Props) {
  return (
    <View className="mt-4 rounded-3xl bg-white py-4">
      <Text className="mb-3 px-4 text-base font-semibold text-slate-800">Saatlik Tahmin</Text>
      <FlatList
        horizontal
        data={hours}
        keyExtractor={(item) => item.time}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item, index }) => (
          <View className="w-16 items-center">
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
          </View>
        )}
      />
    </View>
  );
}
