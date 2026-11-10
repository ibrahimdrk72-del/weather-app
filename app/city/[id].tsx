import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import WeatherView from '../../components/WeatherView';

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

  // Metin olarak gelen parametreleri sayıya çevir
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-sky-50">
      {/* Üst başlıkta şehir adını göster */}
      <Stack.Screen options={{ title: params.name }} />

      {/* Ana ekranla aynı bileşen */}
      <WeatherView latitude={latitude} longitude={longitude} />
    </SafeAreaView>
  );
}
