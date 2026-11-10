import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type Props = {
  message: string;
};

// Kullanıcıya nazik bir bilgi vermek için kullanılan sarı kutu
export default function InfoBanner({ message }: Props) {
  return (
    <View className="mb-4 flex-row items-start rounded-2xl bg-amber-100 p-3">
      <MaterialCommunityIcons name="information-outline" size={20} color="#b45309" />
      <Text className="ml-2 flex-1 text-sm text-amber-800">{message}</Text>
    </View>
  );
}
