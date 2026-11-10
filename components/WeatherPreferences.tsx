import { Pressable, Text, View } from 'react-native';
import { usePreferences } from '../hooks/usePreferences';

const themes = { system: 'Sistem', light: 'Açık', dark: 'Koyu' } as const;

export default function WeatherPreferences() {
  const { theme, unit, update } = usePreferences();
  return (
    <View className="flex-row flex-wrap gap-2 px-4 pb-2">
      {(['system', 'light', 'dark'] as const).map((value) => (
        <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: theme === value }}
          onPress={() => update({ theme: value })}
          className={`rounded-xl px-3 py-2 ${theme === value ? 'bg-sky-700' : 'bg-white dark:bg-slate-800'}`}>
          <Text className={theme === value ? 'text-white' : 'text-slate-700 dark:text-slate-100'}>{themes[value]}</Text>
        </Pressable>
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel="Sıcaklık birimini değiştir"
        onPress={() => update({ unit: unit === 'C' ? 'F' : 'C' })}
        className="rounded-xl bg-white px-3 py-2 dark:bg-slate-800">
        <Text className="text-slate-700 dark:text-slate-100">°{unit}</Text>
      </Pressable>
    </View>
  );
}
