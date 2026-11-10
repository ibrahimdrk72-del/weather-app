import '../global.css'; // Tailwind (NativeWind) stillerini uygulamaya yükler

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Kök layout: tüm ekranları saran Stack (üst üste açılan ekranlar) navigasyonu.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: 'Geri',
          headerTintColor: '#0284c7', // Geri butonunun rengi
          headerTitleStyle: { color: '#1e293b' }, // Başlık yazısı koyu kalsın
        }}
      >
        {/* Alt tab bar'lı ana bölüm; kendi başlığını çizdiği için Stack başlığı gizli */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Arama ekranı alttan açılan modal olarak gösterilir */}
        <Stack.Screen name="search" options={{ presentation: 'modal', title: 'Şehir Ara' }} />
        {/* Şehir detay ekranı; başlığı (şehir adı) ekranın içinden ayarlanır */}
        <Stack.Screen name="city/[id]" options={{ title: '' }} />
      </Stack>
    </>
  );
}
