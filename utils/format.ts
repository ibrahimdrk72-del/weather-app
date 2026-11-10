export type TemperatureUnit = 'C' | 'F';

export function formatTemp(value: number, unit: TemperatureUnit): string {
  return `${Math.round(unit === 'F' ? value * 9 / 5 + 32 : value)}°${unit}`;
}

export function formatMetric(value: number | null | undefined, suffix = ''): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${value}${suffix}` : '—';
}
