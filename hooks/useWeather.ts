import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../services/http';
import { getWeather } from '../services/weather';
import { WeatherData } from '../types/weather';

// Verilen koordinatın hava durumunu getirir ve yükleniyor / hata / veri durumlarını yönetir.
export function useWeather(latitude: number, longitude: number) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true); // İlk yükleme
  const [refreshing, setRefreshing] = useState(false); // Aşağı çekerek yenileme
  const [error, setError] = useState<string | null>(null);

  // useCallback: koordinat değişmedikçe aynı fonksiyon kullanılır
  const fetchWeather = useCallback(async () => {
    try {
      const result = await getWeather(latitude, longitude);
      setData(result);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [latitude, longitude]);

  // İlk açılışta ve "Tekrar dene" butonunda: tam ekran yükleniyor göstergesi ile getir
  const load = useCallback(async () => {
    setLoading(true);
    await fetchWeather();
    setLoading(false);
  }, [fetchWeather]);

  // Aşağı çekince: mevcut veri ekranda kalır, sadece üstte küçük gösterge döner
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWeather();
    setRefreshing(false);
  }, [fetchWeather]);

  // Ekran açıldığında (veya koordinat değiştiğinde) veriyi getir
  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refreshing, error, retry: load, refresh };
}
