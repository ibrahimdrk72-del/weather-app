import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message?: string;
};

// Boş durum: gösterilecek veri olmadığında ortada ikon ve bilgi mesajı
export default function EmptyView({ icon, title, message }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <MaterialCommunityIcons name={icon} size={56} color="#94a3b8" />
      <Text className="mt-3 text-center text-lg font-semibold text-slate-700">{title}</Text>
      {message && <Text className="mt-1 text-center text-base text-slate-500">{message}</Text>}
    </View>
  );
}
