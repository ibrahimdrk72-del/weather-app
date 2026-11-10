import storage from 'expo-sqlite/kv-store';

export const read = (key: string) => storage.getItem(key);
export const write = (key: string, value: string) => storage.setItem(key, value);
export const remove = (key: string) => storage.removeItem(key);
