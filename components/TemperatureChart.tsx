import { Text, View } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { usePreferences } from '../hooks/usePreferences';
import { HourlyItem } from '../types/weather';
import { formatTemp } from '../utils/format';

export default function TemperatureChart({ hours }: { hours: HourlyItem[] }) {
  const { unit } = usePreferences();
  if (hours.length < 2) return null;
  const temperatures = hours.map((hour) => hour.temperature);
  const low = Math.min(...temperatures);
  const high = Math.max(...temperatures);
  const points = temperatures.map((temperature, index) => {
    const x = 4 + index * 232 / (temperatures.length - 1);
    const y = 68 - (temperature - low) * 60 / (high - low || 1);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View className="mx-4 mb-3">
      <Text className="text-xs text-slate-500 dark:text-slate-300">
        24 saat · {formatTemp(low, unit)} – {formatTemp(high, unit)}
      </Text>
      <Svg width="100%" height={80} viewBox="0 0 240 80" preserveAspectRatio="none"
        accessibilityLabel="Önümüzdeki 24 saatin sıcaklık grafiği">
        <Line x1={0} y1={72} x2={240} y2={72} stroke="#64748b" opacity={0.4} />
        <Polyline points={points} fill="none" stroke="#38bdf8" strokeWidth={2} strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
