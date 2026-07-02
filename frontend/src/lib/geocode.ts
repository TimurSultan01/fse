export type GeocodeResult = {
  latitude: number;
  longitude: number;
  label: string;
};

type NominatimEntry = {
  lat: string;
  lon: string;
  display_name: string;
};

/**
 * Wandelt eine Ortsangabe über Nominatim (OpenStreetMap) in Koordinaten um.
 * Kostenlos und ohne API-Key; wird bewusst nur auf Klick ausgelöst, um die
 * Nutzungsrichtlinien (max. 1 Anfrage/Sekunde) einzuhalten.
 */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', trimmed);

  const response = await fetch(url, { headers: { 'Accept-Language': 'de' } });
  if (!response.ok) {
    throw new Error('Ort konnte nicht gefunden werden.');
  }

  const results = (await response.json()) as NominatimEntry[];
  if (results.length === 0) return null;

  const [first] = results;
  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    label: first.display_name,
  };
}
