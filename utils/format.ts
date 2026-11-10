// Sayıları ekranda gösterilecek metne çeviren yardımcılar.

// 17.6 -> "18°"
export function formatTemp(value: number): string {
  return `${Math.round(value)}°`;
}
