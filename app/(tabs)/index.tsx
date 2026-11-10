import { Text, View } from 'react-native';

// Geçici ekran: sonraki aşamalarda doldurulacak
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-sky-50">
      <Text className="text-xl font-bold text-slate-800">Hava Durumu</Text>
    </View>
  );
}
