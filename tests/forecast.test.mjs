import assert from 'node:assert/strict';
import test from 'node:test';

import { CACHE_TTL, parseCachedForecast } from '../services/cache.ts';
import { transformForecast } from '../services/weather.ts';
import { weatherAdvice } from '../utils/advice.ts';
import { parseCity } from '../utils/cities.ts';
import { formatMetric, formatTemp } from '../utils/format.ts';

function response() {
  const sequence = Array.from({ length: 48 }, (_, index) => index);
  const times = sequence.map((index) =>
    `2026-11-${10 + Math.floor(index / 24)}T${String(index % 24).padStart(2, '0')}:00`);
  return {
    current: {
      time: '2026-11-10T14:15', temperature_2m: 12, apparent_temperature: 4,
      relative_humidity_2m: 65, wind_speed_10m: 12, wind_gusts_10m: 42,
      pressure_msl: 1013, visibility: 4800, weather_code: 61, is_day: 1,
    },
    hourly: {
      time: times, temperature_2m: sequence, weather_code: sequence.map(() => 61),
      is_day: sequence.map((hour) => Number(hour % 24 < 18)),
      precipitation_probability: sequence.map(() => null),
    },
    daily: {
      time: ['2026-11-10'], weather_code: [61], temperature_2m_max: [15],
      temperature_2m_min: [4], precipitation_probability_max: [null],
      sunrise: ['2026-11-10T07:00'], sunset: ['2026-11-10T18:00'],
      uv_index_max: [6], precipitation_sum: [3], wind_speed_10m_max: [38],
    },
  };
}

test('converts local forecast hours across midnight and preserves optional metrics', () => {
  const forecast = transformForecast(response());
  assert.equal(forecast.hourly.length, 24);
  assert.equal(forecast.hourly[0].time, '2026-11-10T14:00');
  assert.equal(forecast.hourly[23].time, '2026-11-11T13:00');
  assert.equal(forecast.hourly[0].precipitationProbability, null);
  assert.equal(forecast.current.pressure, 1013);
  assert.equal(forecast.current.visibility, 4800);
  assert.equal(forecast.daily[0].precipitation, 3);

  const incomplete = response();
  delete incomplete.daily.uv_index_max;
  assert.equal(formatMetric(transformForecast(incomplete).daily[0].uv), '—');
  assert.equal(formatMetric(0, ' mm'), '0 mm');
  assert.equal(formatTemp(0, 'F'), '32°F');
});

test('accepts cached forecasts only during the first 24 hours', () => {
  const entry = { savedAt: 1000, data: transformForecast(response()) };
  const raw = JSON.stringify(entry);
  assert.deepEqual(parseCachedForecast(raw, 1000 + CACHE_TTL - 1), entry);
  assert.equal(parseCachedForecast(raw, 1000 + CACHE_TTL), null);
  assert.equal(parseCachedForecast(raw, 999), null);
  assert.equal(parseCachedForecast('{', 1000), null);
});

test('uses wind gusts, daily rain, feels-like temperature and UV to offer advice', () => {
  const { current, daily: [today] } = transformForecast(response());
  assert.equal(weatherAdvice(current, today).length, 4);
  assert.deepEqual(weatherAdvice({ ...current, gusts: null, feelsLike: 12 }, {
    ...today, precipitation: null, uv: null, tempMin: 10,
  }), []);
});

test('rejects missing, array, and out-of-range city parameters while accepting zero coordinates', () => {
  const params = { id: '42', name: ' City ', latitude: '0', longitude: '0' };
  assert.deepEqual(parseCity(params), { id: 42, name: 'City', country: '', latitude: 0, longitude: 0 });
  assert.equal(parseCity({ ...params, latitude: '' }), null);
  assert.equal(parseCity({ ...params, longitude: '181' }), null);
  assert.equal(parseCity({ ...params, id: ['42'] }), null);
});
