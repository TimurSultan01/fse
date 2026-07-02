import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../lib/weather';

type WeatherPanelProps = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  date: string;
  time: string;
};

export default function WeatherPanel({ latitude, longitude, date, time }: WeatherPanelProps) {
  const enabled = typeof latitude === 'number' && typeof longitude === 'number' && Boolean(date);

  const weatherQuery = useQuery({
    queryKey: ['weather', latitude, longitude, date, time],
    queryFn: () => fetchWeather(latitude!, longitude!, date, time),
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  if (!enabled) return null;

  return (
    <div className="weather-panel">
      <h3>Wetter &amp; Wind zur Flugzeit</h3>

      {weatherQuery.isLoading && <p className="loading-note">Lade Wetterdaten...</p>}

      {weatherQuery.isError && (
        <p className="weather-note">Wetterdaten sind aktuell nicht verfügbar.</p>
      )}

      {weatherQuery.isSuccess && weatherQuery.data === null && (
        <p className="weather-note">Für dieses Datum liegt noch keine Vorhersage vor.</p>
      )}

      {weatherQuery.data && (
        <div className="weather-grid">
          <div className="weather-metric">
            <span className="weather-value">{weatherQuery.data.temperature}°C</span>
            <span className="weather-label">Temperatur</span>
          </div>
          <div className="weather-metric">
            <span className="weather-value">{weatherQuery.data.windSpeed} km/h</span>
            <span className="weather-label">Windgeschwindigkeit</span>
          </div>
          <div className="weather-metric">
            <span className="weather-value">
              <span
                className="wind-arrow"
                style={{ transform: `rotate(${weatherQuery.data.windDirection}deg)` }}
                aria-hidden="true"
              >
                ↓
              </span>
              {weatherQuery.data.windLabel}
            </span>
            <span className="weather-label">Windrichtung (aus)</span>
          </div>
        </div>
      )}

      <p className="weather-source">Quelle: Open-Meteo</p>
    </div>
  );
}
