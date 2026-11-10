import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { read, remove, write } from '../db/storage';
import { CachedForecast, parseCachedForecast } from '../services/cache';
import { getErrorMessage } from '../services/http';
import { getWeather } from '../services/weather';

type State = {
  key: string;
  forecast: CachedForecast | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

export function useWeather(latitude: number, longitude: number) {
  const key = `weather:forecast:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
  const [state, setState] = useState<State | null>(null);
  const request = useRef(0);
  const focused = useRef(false);

  const load = useCallback(async (refreshing = false) => {
    if (!focused.current) return;
    const id = ++request.current;
    setState((previous) => ({
      key,
      forecast: refreshing && previous?.key === key ? previous.forecast : null,
      loading: !refreshing,
      refreshing,
      error: null,
    }));

    let forecast: CachedForecast | null = null;
    let error: string | null = null;
    try {
      const data = await getWeather(latitude, longitude);
      if (id !== request.current) return;
      forecast = { data, savedAt: Date.now() };
      void write(key, JSON.stringify(forecast)).catch(() => undefined);
    } catch (failure) {
      if (id !== request.current) return;
      error = getErrorMessage(failure);
      try {
        const raw = await read(key);
        if (id !== request.current) return;
        forecast = parseCachedForecast(raw, Date.now());
        if (raw && !forecast) void remove(key).catch(() => undefined);
      } catch {
        // Storage is optional when retrieving live weather.
      }
    }
    if (id === request.current) {
      setState({ key, forecast, error, loading: false, refreshing: false });
    }
  }, [key, latitude, longitude]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    void load();
    return () => {
      focused.current = false;
      request.current++;
    };
  }, [load]));

  const current = state?.key === key ? state : null;
  return {
    data: current?.forecast?.data ?? null,
    updatedAt: current?.forecast ? new Date(current.forecast.savedAt) : null,
    loading: current?.loading ?? true,
    refreshing: current?.refreshing ?? false,
    error: current?.error ?? null,
    retry: () => load(),
    refresh: () => load(true),
  };
}
