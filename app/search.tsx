import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyView from '../components/EmptyView';
import ErrorView from '../components/ErrorView';
import LoadingView from '../components/LoadingView';
import { useDebounce } from '../hooks/useDebounce';
import { searchCities } from '../services/geocoding';
import { getErrorMessage } from '../services/http';
import { City } from '../types/weather';
import { popularCities } from '../utils/cities';
import { openCity } from '../utils/navigation';

const MIN_LENGTH = 2; // En az kaç karakter yazılınca arama başlasın

// Arama ekranı (modal): kullanıcı yazdıkça şehir önerileri gelir
export default function SearchScreen() {
  const selected = useRef(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0); // "Tekrar dene" aramayı yeniden tetikler

  // Kullanıcı yazmayı bıraktıktan 400 ms sonra güncellenen arama metni
  const debouncedQuery = useDebounce(query.trim(), 400);

  useEffect(() => {
    // Metin çok kısaysa istek atma, listeyi temizle
    if (debouncedQuery.length < MIN_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Eski bir isteğin cevabı geç gelirse yeni sonuçların üzerine yazmasın
    let cancelled = false;

    async function search() {
      setLoading(true);
      setError(null);
      try {
        const cities = await searchCities(debouncedQuery);
        if (!cancelled) setResults(cities);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    search();

    // Temizlik: arama metni değişince bu isteği "iptal edildi" olarak işaretle
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, retryCount]);

  // Şehre dokununca: modalı kapat ve o şehrin detay ekranını aç
  function selectCity(city: City) {
    if (selected.current) return;
    selected.current = true;
    openCity(city, true);
  }

  // Liste dışındaki durumlar (bilgi, yükleniyor, hata) sabit yükseklikte bir alanda gösterilir.
  // Ekranın tam ortasına koysaydık açık klavyenin arkasında kalırlardı.
  function renderStatus() {
    if (query.trim().length < MIN_LENGTH) return null;
    if (error) {
      return <ErrorView message={error} onRetry={() => setRetryCount((count) => count + 1)} />;
    }
    // Kullanıcı hâlâ yazıyorsa (debounce bekleniyorsa) veya istek sürüyorsa
    if (loading || query.trim() !== debouncedQuery) {
      return <LoadingView message="Aranıyor..." />;
    }
    if (results.length === 0) {
      return (
        <EmptyView
          icon="map-marker-off-outline"
          title="Sonuç bulunamadı"
          message="Şehir adını kontrol edip tekrar deneyin."
        />
      );
    }
    return null; // Gösterilecek sonuç var
  }

  // Duruma göre arama kutusunun altında ne gösterileceğini seç
  function renderContent() {
    const status = renderStatus();
    if (status) {
      return <View className="h-60">{status}</View>;
    }
    return (
      <FlatList
        data={query.trim().length < MIN_LENGTH ? popularCities : results}
        ListHeaderComponent={query.trim().length < MIN_LENGTH ? (
          <Text className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-100">Popüler şehirler</Text>
        ) : undefined}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled" // Klavye açıkken de ilk dokunuş şehri seçsin
        keyboardDismissMode="on-drag" // Liste kaydırılınca klavye kapansın
        renderItem={({ item }) => (
          <Pressable
            onPress={() => selectCity(item)}
            accessibilityRole="button"
            className="flex-row items-center border-b border-slate-100 dark:border-slate-700 px-4 py-3 active:bg-sky-50"
          >
            <MaterialCommunityIcons name="map-marker-outline" size={22} color="#0284c7" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.name}</Text>
              {/* İl ve ülke; boş olanlar filtrelenir */}
              <Text className="text-sm text-slate-500 dark:text-slate-300">
                {[item.admin1, item.country].filter(Boolean).join(', ')}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
          </Pressable>
        )}
      />
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-slate-900">
      {/* Arama kutusu */}
      <View className="m-4 flex-row items-center rounded-2xl bg-slate-100 dark:bg-slate-800 px-3">
        <MaterialCommunityIcons name="magnify" size={22} color="#64748b" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Şehir adı yazın (örn. İzmir)"
          placeholderTextColor="#94a3b8"
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
          className="ml-2 flex-1 py-3 text-base text-slate-800 dark:text-slate-100"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Aramayı temizle"
          >
            <MaterialCommunityIcons name="close-circle" size={20} color="#94a3b8" />
          </Pressable>
        )}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}
