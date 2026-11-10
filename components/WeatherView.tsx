import { ReactNode } from 'react';
import { RefreshControl, ScrollView, Text } from 'react-native';

import { useWeather } from '../hooks/useWeather';
import { formatClock } from '../utils/date';
import CurrentWeatherCard from './CurrentWeatherCard';
import DailyForecast from './DailyForecast';
import ErrorView from './ErrorView';
import HourlyForecast from './HourlyForecast';
import InfoBanner from './InfoBanner';
import LoadingView from './LoadingView';
import WeatherDetails from './WeatherDetails';

type Props = {
  latitude: number;
  longitude: number;
  children?: ReactNode; // Kartların üstünde gösterilecek ek içerik (örn. bilgi mesajı)
};

// Bir koordinatın bütün hava durumu içeriği.
// Hem ana ekran hem şehir detay ekranı bu bileşeni kullanır (kod tekrarı olmaz).
export default function WeatherView({ latitude, longitude, children }: Props) {
  const { data, loading, refreshing, error, updatedAt, retry, refresh } = useWeather(latitude, longitude);

  // 1) Yükleniyor
  if (loading) {
    return <LoadingView message="Hava durumu yükleniyor..." />;
  }

  // 2) Hata (elimizde gösterecek hiç veri yoksa)
  if (!data) {
    return <ErrorView message={error ?? 'Hava durumu alınamadı.'} onRetry={retry} />;
  }

  // 3) Veri hazır
  const today = data.daily[0]; // Günlük listenin ilk elemanı bugündür
  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      // Aşağı çekerek yenileme
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#0284c7" />}
    >
      {children}
      {/* Yenileme başarısız olduysa eski veri ekranda kalır, üstte hata mesajı çıkar */}
      {error && <InfoBanner message={error} />}
      <CurrentWeatherCard current={data.current} today={today} />
      <WeatherDetails current={data.current} today={today} />
      <HourlyForecast hours={data.hourly} />
      <DailyForecast days={data.daily} />
      {updatedAt && (
        <Text className="mt-4 text-center text-xs text-slate-400">
          Son güncelleme: {formatClock(updatedAt)} · Yenilemek için aşağı çekin
        </Text>
      )}
    </ScrollView>
  );
}
