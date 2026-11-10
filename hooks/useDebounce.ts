import { useEffect, useState } from 'react';

// Debounce: değer değişmeyi bıraktıktan "delay" ms sonra güncellenen bir kopya döndürür.
// Böylece kullanıcı her harf yazdığında değil, yazmayı bıraktığında istek atılır.
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Değer süre dolmadan tekrar değişirse önceki zamanlayıcı iptal edilir
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
