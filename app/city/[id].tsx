import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WeatherView from '../../components/WeatherView';
import { addFavorite, isFavorite, removeFavorite } from '../../db/favorites';
import { City } from '../../types/weather';
import { confirmRemoveFavorite } from '../../utils/confirm';

// URL parametreleri her zaman metin (string) olarak gelir
type Params = {
  id: string;
  name: string;
  country: string;
  latitude: string;
  longitude: string;
};

// Şehir detay ekranı (dinamik route): /city/311046?name=İzmir&latitude=38.41&longitude=27.14
export default function CityScreen() {
  const params = useLocalSearchParams<Params>();

  // Metin olarak gelen parametreleri sayıya çevirip City nesnesi oluştur
  const city: City = {
    id: Number(params.id),
    name: params.name,
    country: params.country ?? '',
    latitude: Number(params.latitude),
    longitude: Number(params.longitude),
  };

  const [favorite, setFavorite] = useState(false);

  // Ekran açılınca şehrin favorilerde olup olmadığını veritabanından oku
  useEffect(() => {
    isFavorite(city.id)
      .then(setFavorite)
      .catch(() => setFavorite(false));
  }, [city.id]);

  // Favori durumunu veritabanına yazar: true -> ekle, false -> çıkar
  async function saveFavorite(next: boolean) {
    try {
      if (next) {
        await addFavorite(city);
      } else {
        await removeFavorite(city.id);
      }
      setFavorite(next);
    } catch {
      Alert.alert('Hata', 'Favoriler güncellenemedi. Lütfen tekrar deneyin.');
    }
  }

  // Kalp butonu: favoride değilse ekler, favorideyse önce onay sorar
  function toggleFavorite() {
    if (favorite) {
      confirmRemoveFavorite(city, () => saveFavorite(false));
    } else {
      saveFavorite(true);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-sky-50">
      {/* Üst başlık: şehir adı ve sağda favori (kalp) butonu */}
      <Stack.Screen
        options={{
          title: city.name,
          headerRight: () => (
            <Pressable
              onPress={toggleFavorite}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <MaterialCommunityIcons
                name={favorite ? 'heart' : 'heart-outline'}
                size={26}
                color={favorite ? '#ef4444' : '#0284c7'}
              />
            </Pressable>
          ),
        }}
      />

      {/* Ana ekranla aynı bileşen */}
      <WeatherView latitude={city.latitude} longitude={city.longitude} />
    </SafeAreaView>
  );
}
