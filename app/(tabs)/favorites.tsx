import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyView from '../../components/EmptyView';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import { getFavorites, removeFavorite } from '../../db/favorites';
import { getErrorMessage } from '../../services/http';
import { getCurrentSummaries } from '../../services/weather';
import { City, CurrentSummary } from '../../types/weather';
import { confirmRemoveFavorite } from '../../utils/confirm';
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

  // Önce favorileri veritabanından okur, sonra sıcaklıklarını internetten getirir
  const load = useCallback(async () => {
    try {
      const cities = await getFavorites();
      setFavorites(cities);
      setDbError(null);

      // Şehir listesi internetsiz de gösterilebilir; sıcaklık hatası ayrı ele alınır
      try {
        setSummaries(await getCurrentSummaries(cities));
        setWeatherError(null);
      } catch (e) {
        setWeatherError(getErrorMessage(e));
      }
    } catch {
      setDbError('Favoriler okunamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // useFocusEffect: bu sekmeye her dönüldüğünde liste yenilenir
  // (örn. detay ekranında yeni favori eklendikten sonra)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Onay sorulduktan sonra şehri siler ve listeyi günceller
  function handleRemove(city: City) {
    confirmRemoveFavorite(city, async () => {
      try {
        await removeFavorite(city.id);
        setFavorites((list) => list.filter((item) => item.id !== city.id));
      } catch {
        Alert.alert('Hata', 'Şehir silinemedi. Lütfen tekrar deneyin.');
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
          />
        }
        // Sıcaklıklar alınamadıysa listenin üstünde hata kutusu ve "Tekrar dene"
        ListHeaderComponent={
          weatherError ? (
            <View className="mb-4 rounded-2xl bg-amber-100 p-3">
              <Text className="text-sm text-amber-800">Sıcaklıklar alınamadı. {weatherError}</Text>
              <Pressable onPress={load} className="mt-2 self-start active:opacity-70">
                <Text className="text-sm font-bold text-amber-900">Tekrar dene</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const summary = summaries[item.id]; // Henüz gelmediyse undefined
          return (
            <Pressable
              onPress={() => openCity(item)}
              className="mb-3 flex-row items-center rounded-2xl bg-white p-4 active:opacity-70"
            >
              <View className="flex-1">
                <Text numberOfLines={1} className="text-lg font-semibold text-slate-800">
                  {item.name}
                </Text>
                {/* Ülke ve (geldiyse) hava açıklaması: "Türkiye · Parçalı bulutlu" */}
                <Text numberOfLines={1} className="text-sm text-slate-500">
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
              <Text className="ml-2 w-14 text-right text-2xl font-bold text-slate-800">
                {summary ? formatTemp(summary.temperature) : '--'}
              </Text>

              <Pressable
                onPress={() => handleRemove(item)}
                hitSlop={10}
                accessibilityLabel={`${item.name} şehrini favorilerden çıkar`}
                className="ml-3"
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
              </Pressable>
            </Pressable>
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-sky-50">
      <Text className="px-4 py-3 text-2xl font-bold text-slate-800">Favoriler</Text>
      {renderContent()}
    </SafeAreaView>
  );
}
