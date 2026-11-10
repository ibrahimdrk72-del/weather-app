import { router } from 'expo-router';

import { City } from '../types/weather';

// Bir şehrin detay ekranını açar. Şehir bilgileri URL parametresi olarak gönderilir.
// Arama ekranı ve favoriler ekranı aynı fonksiyonu kullanır.
export function openCity(city: City) {
  router.push({
    pathname: '/city/[id]',
    params: {
      id: city.id,
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    },
  });
}
