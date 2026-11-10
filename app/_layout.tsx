import '../global.css'; // Tailwind (NativeWind) stillerini uygulamaya yükler

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PreferencesProvider, usePreferences } from '../hooks/usePreferences';

// Kök layout: tüm ekranları saran Stack (üst üste açılan ekranlar) navigasyonu.
export default function RootLayout() {
  return <PreferencesProvider><Navigation /></PreferencesProvider>;
}

function Navigation() {
  const { dark } = usePreferences();
  return (
    <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerBackTitle: 'Geri',
          headerTintColor: '#0284c7', // Geri butonunun rengi
          headerTitleStyle: { color: dark ? '#f1f5f9' : '#1e293b' }, // Başlık yazısı koyu kalsın
        }}
      >
        {/* Alt tab bar'lı ana bölüm; kendi başlığını çizdiği için Stack başlığı gizli */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Arama ekranı alttan açılan modal olarak gösterilir */}
        <Stack.Screen name="search" options={{ presentation: 'modal', title: 'Şehir Ara' }} />
        {/* Şehir detay ekranı; başlığı (şehir adı) ekranın içinden ayarlanır */}
        <Stack.Screen name="city/[id]" options={{ title: '' }} />
      </Stack>
    </ThemeProvider>
  );
}
