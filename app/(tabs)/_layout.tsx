import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

// Alt tab bar: "Hava Durumu" ve "Favoriler" sekmeleri
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0284c7' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hava Durumu',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="weather-partly-cloudy" color={typeof color === 'number' ? undefined : color ?? undefined} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={typeof color === 'number' ? undefined : color ?? undefined} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
