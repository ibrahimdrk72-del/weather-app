import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

type Place = { name: string; latitude: number; longitude: number };
const DEFAULT_PLACE: Place = { name: 'İstanbul', latitude: 41.0138, longitude: 28.9497 };

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Zaman aşımı')), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export function useLocation() {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function findPlace() {
      try {
        const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), 10000);
        if (!active) return;
        if (status !== 'granted') {
          setPlace(DEFAULT_PLACE);
          setMessage('Konum izni verilmediği için İstanbul gösteriliyor.');
          return;
        }

        const position = await withTimeout((async () => {
          const last = Platform.OS === 'web' ? null : await Location.getLastKnownPositionAsync({ maxAge: 600000 });
          if (last) return last;
          if (!active) throw new Error('Konum isteği kapatıldı');
          return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        })(), 10000);
        if (!active) return;

        const { latitude, longitude } = position.coords;
        let name = 'Konumum';
        if (Platform.OS !== 'web') {
          try {
            const [address] = await withTimeout(Location.reverseGeocodeAsync({ latitude, longitude }), 3500);
            name = address?.city ?? address?.subregion ?? address?.district ?? address?.region ?? name;
          } catch {
            // Koordinatlar tahmin için yeterlidir.
          }
        }

        if (active) {
          setPlace({ name, latitude, longitude });
          setMessage(null);
        }
      } catch {
        if (active) {
          setPlace(DEFAULT_PLACE);
          setMessage('Konumunuz alınamadığı için İstanbul gösteriliyor.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void findPlace();
    return () => { active = false; };
  }, [attempt]);

  return {
    place, loading, message,
    retry: () => {
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
