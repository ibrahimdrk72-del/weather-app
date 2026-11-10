import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InfoBanner from '../../components/InfoBanner';
import LoadingView from '../../components/LoadingView';
import WeatherView from '../../components/WeatherView';
import { useLocation } from '../../hooks/useLocation';

// Ana ekran: kullanıcının konumunun (izin yoksa İstanbul'un) hava durumu
export default function HomeScreen() {
  const { place, loading, message } = useLocation();

  return (
    // edges: sadece üst kenarda güvenli alan boşluğu bırak (altı tab bar hallediyor)
    <SafeAreaView edges={['top']} className="flex-1 bg-sky-50">
      {/* Başlık: yer adı ve arama butonu */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-1 flex-row items-center">
          <MaterialCommunityIcons name="map-marker" size={24} color="#0284c7" />
          <Text numberOfLines={1} className="ml-1 flex-1 text-2xl font-bold text-slate-800">
            {place?.name ?? 'Hava Durumu'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="button"
          accessibilityLabel="Şehir ara"
          className="rounded-full bg-white p-2 active:opacity-70"
        >
          <MaterialCommunityIcons name="magnify" size={26} color="#0284c7" />
        </Pressable>
      </View>

      {loading || !place ? (
        <LoadingView message="Konumunuz alınıyor..." />
      ) : (
        <WeatherView latitude={place.latitude} longitude={place.longitude}>
          {/* Konum izni yoksa nazik bilgi mesajı */}
          {message && <InfoBanner message={message} />}
        </WeatherView>
      )}
    </SafeAreaView>
  );
}
