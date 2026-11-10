import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyView from '../../components/EmptyView';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import { getFavorites, removeFavorite } from '../../db/favorites';
import { getErrorMessage } from '../../services/http';
import { getCurrentSummaries } from '../../services/weather';
import { City, CurrentSummary } from '../../types/weather';
import { confirmRemoveFavorite } from '../../utils/confirm';
import { usePreferences } from '../../hooks/usePreferences';
import { formatTemp } from '../../utils/format';
import { openCity } from '../../utils/navigation';
import { getWeatherDescription, getWeatherIcon } from '../../utils/weatherCodes';

// Favoriler ekranı: kayıtlı şehirler ve anlık sıcaklıkları
export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<City[]>([]);
  // Şehir id -> anlık sıcaklık özeti
  const [summaries, setSummaries] = useState<Record<number, CurrentSummary>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null); // Veritabanı okunamadı
  const [weatherError, setWeatherError] = useState<string | null>(null); // Sıcaklıklar alınamadı

  const { unit } = usePreferences();
  const request = useRef(0);
  const focused = useRef(false);
  const pendingRemovals = useRef(0);

  const load = useCallback(async () => {
    if (!focused.current || pendingRemovals.current > 0) return;
    const id = ++request.current;
    try {
      const cities = await getFavorites();
      if (id !== request.current) return;
      setFavorites(cities);
      setDbError(null);
      try {
        const next = await getCurrentSummaries(cities);
        if (id !== request.current) return;
        setSummaries(next);
        setWeatherError(null);
      } catch (error) {
        if (id === request.current) {
          setSummaries({});
          setWeatherError(getErrorMessage(error));
        }
      }
    } catch {
      if (id === request.current) setDbError('Favoriler okunamadı. Lütfen tekrar deneyin.');
    } finally {
      if (id === request.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    void load();
    return () => {
      focused.current = false;
      request.current++;
    };
  }, [load]));

  function handleRemove(city: City) {
    confirmRemoveFavorite(city, async () => {
      if (!focused.current) return;
      pendingRemovals.current++;
      request.current++;
      try {
        await removeFavorite(city.id);
        if (focused.current) setFavorites((list) => list.filter((item) => item.id !== city.id));
      } catch {
        if (focused.current) {
          const message = 'Şehir silinemedi. Lütfen tekrar deneyin.';
          if (Platform.OS === 'web') window.alert(message);
          else Alert.alert('Hata', message);
        }
      } finally {
        pendingRemovals.current--;
        void load();
      }
    });
  }

  // Duruma göre başlığın altında ne gösterileceğini seç
  function renderContent() {
    if (loading) {
      return <LoadingView message="Favoriler yükleniyor..." />;
    }
    if (dbError) {
      return <ErrorView message={dbError} onRetry={load} />;
    }
    if (favorites.length === 0) {
      return (
        <EmptyView
          icon="heart-outline"
          title="Henüz favori şehriniz yok"
          message="Bir şehir arayıp sağ üstteki kalp simgesine dokunarak favorilerinize ekleyebilirsiniz."
        />
      );
    }
    return (
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#0284c7"
            colors={['#0284c7']}
          />
        }
        // Sıcaklıklar alınamadıysa listenin üstünde hata kutusu ve "Tekrar dene"
        ListHeaderComponent={
          weatherError ? (
            <View className="mb-4 rounded-2xl bg-amber-100 p-3">
              <Text className="text-sm text-amber-800">Sıcaklıklar alınamadı. {weatherError}</Text>
              <Pressable
                onPress={load}
                hitSlop={10}
                accessibilityRole="button"
                className="mt-2 self-start active:opacity-70"
              >
                <Text className="text-sm font-bold text-amber-900">Tekrar dene</Text>
              </Pressable>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const summary = summaries[item.id]; // Henüz gelmediyse undefined
          return (
            <View className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
              <Pressable onPress={() => openCity(item)} accessibilityRole="button"
                className="flex-1 flex-row items-center active:opacity-70">
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {item.name}
                  </Text>
                  {/* Ülke ve (geldiyse) hava açıklaması: "Türkiye · Parçalı bulutlu" */}
                  <Text numberOfLines={1} className="text-sm text-slate-500 dark:text-slate-300">
                    {[item.country, summary && getWeatherDescription(summary.weatherCode)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>

                {/* Anlık ikon ve sıcaklık (veri yoksa "--") */}
                {summary && (
                  <MaterialCommunityIcons
                    name={getWeatherIcon(summary.weatherCode, summary.isDay)}
                    size={28}
                    color="#0284c7"
                  />
                )}
                <Text className="ml-2 text-right text-xl font-bold text-slate-800 dark:text-slate-100">
                  {summary ? formatTemp(summary.temperature, unit) : '—'}
                </Text>

              </Pressable>
              <Pressable
                onPress={() => handleRemove(item)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} şehrini favorilerden çıkar`}
                className="ml-3"
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
              </Pressable>
            </View>
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-sky-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between gap-2 px-4 py-3">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">Favoriler</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/search')}
          className="rounded-xl bg-sky-700 px-3 py-2">
          <Text className="font-semibold text-white">Şehir ekle</Text>
        </Pressable>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}
