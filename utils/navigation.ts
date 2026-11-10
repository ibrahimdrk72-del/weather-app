import { router } from 'expo-router';

import { City } from '../types/weather';

// Bir şehrin detay ekranını açar. Şehir bilgileri URL parametresi olarak gönderilir.
// Arama ekranı ve favoriler ekranı aynı fonksiyonu kullanır.
export function openCity(city: City, replace = false) {
  const href = {
    pathname: '/city/[id]' as const,
    params: {
      id: city.id,
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    },
  };
  if (replace) router.replace(href);
  else router.push(href);
}
