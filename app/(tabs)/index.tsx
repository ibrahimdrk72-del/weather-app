import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InfoBanner from '../../components/InfoBanner';
import LoadingView from '../../components/LoadingView';
import WeatherPreferences from '../../components/WeatherPreferences';
import WeatherView from '../../components/WeatherView';
import { useLocation } from '../../hooks/useLocation';

// Ana ekran: kullanıcının konumunun (izin yoksa İstanbul'un) hava durumu
export default function HomeScreen() {
  const { place, loading, message, retry } = useLocation();

  return (
    // edges: sadece üst kenarda güvenli alan boşluğu bırak (altı tab bar hallediyor)
    <SafeAreaView edges={['top']} className="flex-1 bg-sky-50 dark:bg-slate-950">
      {/* Başlık: yer adı ve arama butonu */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-1 flex-row items-center">
          <MaterialCommunityIcons name="map-marker" size={24} color="#0284c7" />
          <Text numberOfLines={1} className="ml-1 flex-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
            {place?.name ?? 'H'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="button"
          accessibilityLabel="Şehir ara"
          className="rounded-full bg-white dark:bg-slate-900 p-2 active:opacity-70"
        >
          <MaterialCommunityIcons name="magnify" size={26} color="#0284c7" />
        </Pressable>
      </View>

      <WeatherPreferences />
      {message && !loading && (
        <View className="px-4">
          <InfoBanner message={message} />
          <Pressable accessibilityRole="button" onPress={retry} className="mb-1 self-start px-2 py-1">
            <Text className="font-semibold text-sky-700 dark:text-sky-300">Konumu tekrar dene</Text>
          </Pressable>
        </View>
      )}
      {loading || !place ? (
        <LoadingView message="Konumunuz alınıyor..." />
      ) : (
        <WeatherView cityName={place.name} latitude={place.latitude} longitude={place.longitude} />
      )}
    </SafeAreaView>
  );
}
