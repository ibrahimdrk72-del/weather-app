import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// Ekranda hava durumu gösterilecek yer
export type Place = {
  name: string;
  latitude: number;
  longitude: number;
};

// Konum alınamazsa gösterilecek varsayılan şehir
const DEFAULT_PLACE: Place = { name: 'İstanbul', latitude: 41.0138, longitude: 28.9497 };

// Konum bu sürede alınamazsa beklemeyi bırakıp varsayılan şehre döneriz
const LOCATION_TIMEOUT_MS = 10000;

// Bir işlemi en fazla "ms" kadar bekler; süre dolarsa hata fırlatır
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Zaman aşımı')), ms)
  );
  // Promise.race: hangisi önce biterse onun sonucu kullanılır
  return Promise.race([promise, timeout]);
}

// Kullanıcının konumunu bulur. İzin verilmezse veya konum alınamazsa İstanbul'a döner.
export function useLocation() {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  // Varsayılan şehir gösteriliyorsa kullanıcıya verilecek bilgi mesajı
  const [message, setMessage] = useState<string | null>(null);

  // [] -> bu etki sadece ekran ilk açıldığında bir kez çalışır
  useEffect(() => {
    async function findPlace() {
      try {
        // 1) İzin iste (daha önce sorulduysa sistem tekrar sormaz, kayıtlı cevabı döndürür)
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPlace(DEFAULT_PLACE);
          setMessage(
            'Konum izni verilmediği için İstanbul gösteriliyor. Dilerseniz telefonunuzun ayarlarından konum iznini açabilirsiniz.'
          );
          return;
        }

        // 2) Önce son 10 dakika içinde kaydedilmiş konumu dene (hızlı), yoksa güncel konumu al.
        // Hava durumu için şehir düzeyinde konum yeterli olduğundan düşük hassasiyet istiyoruz.
        const position =
          (await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 })) ??
          (await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
            LOCATION_TIMEOUT_MS
          ));
        const { latitude, longitude } = position.coords;

        // 3) Koordinattan yer adını bul (bulunamazsa "Konumum" yaz)
        let name = 'Konumum';
        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
          name = address?.city ?? address?.subregion ?? address?.district ?? address?.region ?? name;
        } catch {
          // Yer adı bulunamadıysa sorun değil, hava durumu yine gösterilir
        }

        setPlace({ name, latitude, longitude });
      } catch {
        // Konum servisi kapalı olabilir veya konum alınamamış olabilir
        setPlace(DEFAULT_PLACE);
        setMessage('Konumunuz alınamadığı için İstanbul gösteriliyor.');
      } finally {
        setLoading(false);
      }
    }

    findPlace();
  }, []);

  return { place, loading, message };
}
