import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DailyItem } from '../types/weather';
import { formatTime, getDayName } from '../utils/date';
import { usePreferences } from '../hooks/usePreferences';
import { formatMetric, formatTemp } from '../utils/format';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodes';

export default function DailyForecast({ days }: { days: DailyItem[] }) {
  const { unit } = usePreferences();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View className="mt-4 rounded-3xl bg-white p-4 dark:bg-slate-900">
      <Text className="mb-1 text-base font-semibold text-slate-800 dark:text-slate-100">7 Günlük Tahmin</Text>
      {days.map((day, index) => {
        const open = expanded === day.date;
        return (
          <View key={day.date} className="border-b border-slate-100 dark:border-slate-700">
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }}
              onPress={() => setExpanded(open ? null : day.date)} className="flex-row items-center gap-2 py-3">
              <Text className="flex-1 text-slate-700 dark:text-slate-200">{getDayName(day.date, index)}</Text>
              <MaterialCommunityIcons name={getWeatherIcon(day.weatherCode)} size={24} color="#0284c7" />
              <Text className="text-slate-500 dark:text-slate-300">{formatTemp(day.tempMin, unit)}</Text>
              <Text className="font-semibold text-slate-800 dark:text-slate-100">{formatTemp(day.tempMax, unit)}</Text>
              <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#64748b" />
            </Pressable>
            {open && (
              <View className="gap-1 pb-3">
                <Text className="font-semibold text-slate-800 dark:text-slate-100">{getWeatherDescription(day.weatherCode)}</Text>
                <Text className="text-slate-700 dark:text-slate-200">
                  Yağış {formatMetric(day.precipitation, ' mm')} · Olasılık {formatMetric(day.precipitationProbability, '%')}
                </Text>
                <Text className="text-slate-700 dark:text-slate-200">
                  UV {formatMetric(day.uv)} · Rüzgâr {formatMetric(day.maxWind, ' km/sa')}
                </Text>
                <Text className="text-slate-700 dark:text-slate-200">
                  Gündoğumu {formatTime(day.sunrise)} · Günbatımı {formatTime(day.sunset)}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
