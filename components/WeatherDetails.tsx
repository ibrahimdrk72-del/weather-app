import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { CurrentWeather, DailyItem } from '../types/weather';
import { formatMetric } from '../utils/format';
import { formatTime } from '../utils/date';

type Props = {
  current: CurrentWeather;
  today: DailyItem;
};

type TileProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
};

// Tek bir bilgi kutusu: ikon, başlık ve değer
function DetailTile({ icon, label, value }: TileProps) {
  return (
    // w-1/2: her satıra iki kutu sığar; p-1.5 kutular arasındaki boşluğu verir
    <View className="w-1/2 p-1.5">
      <View className="flex-row items-center rounded-2xl bg-white dark:bg-slate-900 p-3">
        <MaterialCommunityIcons name={icon} size={26} color="#0284c7" />
        <View className="ml-3 flex-1">
          <Text className="text-xs text-slate-500 dark:text-slate-300">{label}</Text>
          <Text numberOfLines={1} className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Ayrıntı kutuları (2 x 2): nem, rüzgar, gün doğumu, gün batımı
export default function WeatherDetails({ current, today }: Props) {
  return (
    // -mx-1.5: kutuların kenar boşluğunu dengeler, kartlarla aynı hizada durur
    <View className="-mx-1.5 mt-2.5 flex-row flex-wrap">
      <DetailTile icon="water-percent" label="Nem" value={`%${current.humidity}`} />
      <DetailTile icon="weather-windy" label="Rüzgar" value={`${Math.round(current.windSpeed)} km/sa`} />
      <DetailTile icon="weather-windy" label="Rüzgâr hamlesi" value={formatMetric(current.gusts, ' km/sa')} />
      <DetailTile icon="gauge" label="Basınç" value={formatMetric(current.pressure, ' hPa')} />
      <DetailTile icon="eye-outline" label="Görüş" value={formatMetric(current.visibility == null ? null : Math.round(current.visibility / 100) / 10, ' km')} />
      <DetailTile icon="white-balance-sunny" label="UV indeksi" value={formatMetric(today.uv)} />
      <DetailTile icon="weather-rainy" label="Günlük yağış" value={formatMetric(today.precipitation, ' mm')} />
      <DetailTile icon="weather-sunset-up" label="Gün doğumu" value={formatTime(today.sunrise)} />
      <DetailTile icon="weather-sunset-down" label="Gün batımı" value={formatTime(today.sunset)} />
    </View>
  );
}
