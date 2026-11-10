import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WeatherView from '../../components/WeatherView';
import { addFavorite, isFavorite, removeFavorite } from '../../db/favorites';
import { City } from '../../types/weather';
import { parseCity } from '../../utils/cities';
import { confirmRemoveFavorite } from '../../utils/confirm';

export default function CityScreen() {
  const city = parseCity(useLocalSearchParams());
  if (!city) {
    return (
      <SafeAreaView className="flex-1 bg-sky-50 p-4 dark:bg-slate-950">
        <Stack.Screen options={{ title: 'Geçersiz şehir' }} />
        <Text className="text-slate-800 dark:text-slate-100">Şehir bağlantısındaki bilgiler geçersiz.</Text>
      </SafeAreaView>
    );
  }
  return <CityDetails key={city.id} city={city} />;
}

function CityDetails({ city }: { city: City }) {
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(true);
  const locked = useRef(true);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    void isFavorite(city.id).then((value) => {
      if (mounted.current) setFavorite(value);
    }).catch(() => undefined).finally(() => {
      if (mounted.current) {
        locked.current = false;
        setBusy(false);
      }
    });
    return () => { mounted.current = false; };
  }, [city.id]);

  async function saveFavorite(next: boolean) {
    if (locked.current || !mounted.current) return;
    locked.current = true;
    setBusy(true);
    try {
      if (next) await addFavorite(city);
      else await removeFavorite(city.id);
      if (mounted.current) setFavorite(next);
    } catch {
      if (mounted.current) {
        const message = 'Favoriler güncellenemedi. Lütfen tekrar deneyin.';
        if (Platform.OS === 'web') window.alert(message);
        else Alert.alert('Hata', message);
      }
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-sky-50 dark:bg-slate-950">
      <Stack.Screen options={{
        title: city.name,
        headerRight: () => (
          <Pressable
            disabled={busy}
            onPress={() => favorite ? confirmRemoveFavorite(city, () => saveFavorite(false)) : saveFavorite(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <MaterialCommunityIcons name={favorite ? 'heart' : 'heart-outline'} size={26}
              color={busy ? '#94a3b8' : favorite ? '#ef4444' : '#0284c7'} />
          </Pressable>
        ),
      }} />
      <WeatherView cityName={city.name} latitude={city.latitude} longitude={city.longitude} />
    </SafeAreaView>
  );
}
