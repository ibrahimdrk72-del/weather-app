import { ActivityIndicator, Text, View } from 'react-native';

type Props = {
  message?: string;
};

// Yükleniyor durumu: ortada dönen gösterge ve kısa bir mesaj
export default function LoadingView({ message = 'Yükleniyor...' }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <ActivityIndicator size="large" color="#0284c7" />
      <Text className="mt-3 text-base text-slate-500">{message}</Text>
    </View>
  );
}
