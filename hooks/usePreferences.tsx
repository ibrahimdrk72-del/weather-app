import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeWindScheme } from 'nativewind';
import { read, write } from '../db/storage';
import { TemperatureUnit } from '../utils/format';

type Theme = 'system' | 'light' | 'dark';
type Preferences = { theme: Theme; unit: TemperatureUnit };
const defaults: Preferences = { theme: 'system', unit: 'C' };
const key = 'weather:preferences';
const Context = createContext({ ...defaults, dark: false, update: (_patch: Partial<Preferences>) => {} });

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaults);
  const [ready, setReady] = useState(false);
  const { colorScheme, setColorScheme } = useNativeWindScheme();

  useEffect(() => {
    let active = true;
    void read(key).then((raw) => {
      if (!active || !raw) return;
      const stored = JSON.parse(raw);
      setPreferences({
        theme: stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : 'system',
        unit: stored.unit === 'F' ? 'F' : 'C',
      });
    }).catch(() => undefined).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setColorScheme(preferences.theme);
  }, [preferences.theme, setColorScheme]);

  useEffect(() => {
    if (ready) void write(key, JSON.stringify(preferences)).catch(() => undefined);
  }, [preferences, ready]);

  return (
    <Context.Provider value={{
      ...preferences,
      dark: colorScheme === 'dark',
      update: (patch) => setPreferences((previous) => ({ ...previous, ...patch })),
    }}>
      {ready ? children : null}
    </Context.Provider>
  );
}

export const usePreferences = () => useContext(Context);
