import { useIsFocused } from 'expo-router';
import { Alert, Platform, Pressable, RefreshControl, ScrollView, Share, Text, View } from 'react-native';

import { useWeather } from '../hooks/useWeather';
import { usePreferences } from '../hooks/usePreferences';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { weatherAdvice } from '../utils/advice';
import { formatTemp } from '../utils/format';
import { getWeatherDescription } from '../utils/weatherCodes';
import { WeatherEntrance } from './WeatherMotion';
import CurrentWeatherCard from './CurrentWeatherCard';
import DailyForecast from './DailyForecast';
import ErrorView from './ErrorView';
import HourlyForecast from './HourlyForecast';
import InfoBanner from './InfoBanner';
import LoadingView from './LoadingView';
import WeatherDetails from './WeatherDetails';

type Props = {
  cityName: string;
  latitude: number;
  longitude: number;
};

// Bir koordinatın bütün hava durumu içeriği.
// Hem ana ekran hem şehir detay ekranı bu bileşeni kullanır (kod tekrarı olmaz).
export default function WeatherView({ cityName, latitude, longitude }: Props) {
  const { data, loading, refreshing, error, updatedAt, retry, refresh } = useWeather(latitude, longitude);

  const { unit } = usePreferences();
  const prefersReducedMotion = useReducedMotion();
  const focused = useIsFocused();
  const reduced = prefersReducedMotion || !focused;

  // 1) Yükleniyor
  if (loading) {
    return <LoadingView message="Hava durumu yükleniyor..." />;
  }

  // 2) Hata (elimizde gösterecek hiç veri yoksa)
  if (!data) {
    return <ErrorView message={error ?? 'H'} onRetry={retry} />;
  }

  // 3) Veri hazır
  const today = data.daily[0]; // Günlük listenin ilk elemanı bugündür
  const advice = weatherAdvice(data.current, today);
  const current = data.current;
  const timestamp = updatedAt?.toLocaleString('tr-TR');
  const canShare = Platform.OS !== 'web' || (typeof navigator !== 'undefined' && typeof navigator.share === 'function');

  async function shareWeather() {
    const message = `${cityName} · ${formatTemp(current.temperature, unit)} · ${getWeatherDescription(current.weatherCode)}` +
      (error ? ` (kayıtlı tahmin, ${timestamp})` : '');
    try {
      if (Platform.OS === 'web') await navigator.share({ text: message });
      else await Share.share({ message });
    } catch (failure) {
      if (failure instanceof Error && failure.name === 'AbortError') return;
      if (Platform.OS === 'web') window.alert('Hava durumu paylaşılamadı.');
      else Alert.alert('Hata', 'Hava durumu paylaşılamadı.');
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      // Aşağı çekerek yenileme
      refreshControl={
        // tintColor iOS'ta, colors Android'de göstergenin rengini belirler
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor="#0284c7"
          colors={['#0284c7']}
        />
      }
    >
      {error && (
        <InfoBanner message={`Eski veri · ${timestamp}. Kayıtlı tahmin gösteriliyor. ${error}`} />
      )}
      <WeatherEntrance delay={0} reduced={reduced}>
        <CurrentWeatherCard current={current} today={today} reduced={reduced} />
      </WeatherEntrance>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {canShare && (
          <Pressable accessibilityRole="button" onPress={shareWeather} className="rounded-xl bg-sky-700 px-4 py-2">
            <Text className="font-semibold text-white">Hava durumunu paylaş</Text>
          </Pressable>
        )}
        {Platform.OS === 'web' && (
          <Pressable accessibilityRole="button" onPress={refresh} className="rounded-xl bg-white px-4 py-2 dark:bg-slate-900">
            <Text className="font-semibold text-slate-700 dark:text-slate-200">{refreshing ? 'Yenileniyor…' : 'Yenile'}</Text>
          </Pressable>
        )}
      </View>
      <WeatherEntrance delay={70} reduced={reduced}>
        <WeatherDetails current={current} today={today} />
        {advice.length > 0 && (
          <View className="my-2 gap-2 rounded-2xl bg-white p-4 dark:bg-slate-900">
            <Text className="font-semibold text-slate-800 dark:text-slate-100">Hava önerileri</Text>
            {advice.map((message) => (
              <Text key={message} className="text-slate-700 dark:text-slate-200">{message}</Text>
            ))}
          </View>
        )}
      </WeatherEntrance>
      <WeatherEntrance delay={140} reduced={reduced}><HourlyForecast hours={data.hourly} /></WeatherEntrance>
      <WeatherEntrance delay={210} reduced={reduced}><DailyForecast days={data.daily} /></WeatherEntrance>
      {timestamp && (
        <Text className="mt-4 text-center text-xs text-slate-500 dark:text-slate-300">
          Son güncelleme · {timestamp}
        </Text>
      )}
    </ScrollView>
  );
}
