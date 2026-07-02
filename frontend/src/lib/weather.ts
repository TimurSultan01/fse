export type WeatherInfo = {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  windLabel: string;
};

const COMPASS = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];

export function degreesToCompass(degrees: number): string {
  return COMPASS[Math.round(degrees / 45) % 8];
}

type OpenMeteoResponse = {
  hourly?: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
  };
};

/**
 * Holt eine stündliche Vorhersage von Open-Meteo (kostenlos, kein API-Key) und
 * gibt die Werte zur passenden Stunde des Flugtreffens zurück. Liefert null,
 * wenn für das Datum keine Daten verfügbar sind (z. B. zu weit in der Zukunft).
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  date: string,
  time: string,
): Promise<WeatherInfo | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('hourly', 'temperature_2m,wind_speed_10m,wind_direction_10m');
  url.searchParams.set('start_date', date);
  url.searchParams.set('end_date', date);
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Wetterdaten konnten nicht geladen werden.');
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const hourly = data.hourly;
  if (!hourly || hourly.time.length === 0) {
    return null;
  }

  const targetHour = `${date}T${(time || '12:00').slice(0, 2)}:00`;
  let index = hourly.time.findIndex((entry) => entry === targetHour);
  if (index < 0) index = Math.min(12, hourly.time.length - 1);

  const direction = hourly.wind_direction_10m[index];

  return {
    temperature: Math.round(hourly.temperature_2m[index]),
    windSpeed: Math.round(hourly.wind_speed_10m[index]),
    windDirection: direction,
    windLabel: degreesToCompass(direction),
  };
}
