import { Alert, Platform } from 'react-native';

import { City } from '../types/weather';

// Favoriden silmeden önce kullanıcıya onay sorar. "Sil" seçilirse onConfirm çalışır.
export function confirmRemoveFavorite(city: City, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${city.name} favorilerden çıkarılsın mı?`)) onConfirm();
    return;
  }
  Alert.alert('Favorilerden çıkar', `${city.name} favorilerden çıkarılsın mı?`, [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: onConfirm },
  ]);
}
