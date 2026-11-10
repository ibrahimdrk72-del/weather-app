// Tüm API isteklerinin geçtiği ortak fonksiyon.
// fetch'e zaman aşımı (timeout) ekler ve hataları Türkçe mesaja çevirir.

const TIMEOUT_MS = 10000; // 10 saniye

export async function fetchJson<T>(url: string): Promise<T> {
  // AbortController isteği yarıda kesmemizi sağlar
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    // Sunucu cevap verdi ama hata kodu döndü (örn. 400, 429, 500)
    if (!response.ok) {
      throw new Error('Sunucudan beklenmeyen bir cevap geldi. Lütfen daha sonra tekrar deneyin.');
    }

    return (await response.json()) as T;
  } catch (error) {
    // Süre doldu ve isteği biz iptal ettik
    if (controller.signal.aborted) {
      throw new Error('İstek zaman aşımına uğradı. Bağlantınızı kontrol edip tekrar deneyin.');
    }
    // İnternet yoksa fetch "TypeError" fırlatır
    if (error instanceof TypeError) {
      throw new Error('İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.');
    }
    // Cevap geçerli bir JSON değilse response.json() "SyntaxError" fırlatır
    if (error instanceof SyntaxError) {
      throw new Error('Sunucudan gelen cevap okunamadı. Lütfen daha sonra tekrar deneyin.');
    }
    throw error;
  } finally {
    // İstek bitince zamanlayıcıyı temizle
    clearTimeout(timer);
  }
}

// Yakalanan hatadan ekranda gösterilecek mesajı çıkarır
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
}
