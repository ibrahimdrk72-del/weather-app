import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  message: string;
  onRetry: () => void;
};

// Hata durumu: anlaşılır mesaj ve "Tekrar dene" butonu
export default function ErrorView({ message, onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <MaterialCommunityIcons name="wifi-off" size={56} color="#94a3b8" />
      <Text className="mt-3 text-center text-base text-slate-600">{message}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        className="mt-5 rounded-full bg-sky-600 px-6 py-3 active:opacity-70"
      >
        <Text className="text-base font-semibold text-white">Tekrar dene</Text>
      </Pressable>
    </View>
  );
}
