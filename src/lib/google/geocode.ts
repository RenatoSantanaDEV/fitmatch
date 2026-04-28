export type GeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

type GoogleGeocodeJson = {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }>;
};

export async function geocodeAddress(address: string, apiKey: string): Promise<GeocodeResult> {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error('Endereço vazio.');
  }
  if (!apiKey) {
    throw new Error('Chave da API de geocodificação não configurada.');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', trimmed);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('region', 'br');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('Falha na requisição ao Google Geocoding.');
  }

  const data = (await res.json()) as GoogleGeocodeJson;
  if (data.status !== 'OK' || !data.results?.[0]) {
    const msg = data.error_message || data.status || 'Geocodificação sem resultados.';
    throw new Error(msg);
  }

  const loc = data.results[0].geometry.location;
  return {
    latitude: loc.lat,
    longitude: loc.lng,
    formattedAddress: data.results[0].formatted_address,
  };
}
