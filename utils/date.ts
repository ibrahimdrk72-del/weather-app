// Tarih ve saat ile ilgili küçük yardımcı fonksiyonlar (Türkçe).

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// "2026-11-10" metnini Date nesnesine çevirir.
// new Date("2026-11-10") UTC kabul edip günü kaydırabildiği için parçalayarak oluşturuyoruz.
function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// "2026-11-10" -> "Salı". Listenin ilk elemanı (index 0) için "Bugün" yazılır.
export function getDayName(date: string, index: number): string {
  if (index === 0) return 'Bugün';
  return DAY_NAMES[parseDate(date).getDay()];
}

// "2026-11-10" -> "10 Kasım Salı"
export function formatLongDate(date: string): string {
  const d = parseDate(date);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${DAY_NAMES[d.getDay()]}`;
}

// "2026-11-10T14:00" -> "14:00"
export function formatTime(time: string): string {
  return time.slice(11, 16);
}

// Saatlik listede kullanılır: ilk eleman için "Şimdi", diğerleri için "14:00" yazılır.
export function formatHour(time: string, index: number): string {
  if (index === 0) return 'Şimdi';
  return formatTime(time);
}

// Date nesnesi -> "14:05" (telefonun saatine göre). "Son güncelleme" yazısı için.
export function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
