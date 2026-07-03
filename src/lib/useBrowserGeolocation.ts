'use client';

import { useEffect, useState } from 'react';

const GEOLOCATION_TIMEOUT_MS = 12_000;
const GEOLOCATION_MAXIMUM_AGE_MS = 60_000;

export interface BrowserGeolocationResult {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

export function useBrowserGeolocation(enabled: boolean) {
  const [location, setLocation] = useState<BrowserGeolocationResult | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocalização não disponível neste navegador.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let city: string | undefined;
        let state: string | undefined;

        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          const geo: { city?: string; state?: string } = await res.json().catch(() => ({}));
          if (res.ok) {
            city = geo.city;
            state = geo.state;
          }
        } catch {
          /* reverse geocode is best-effort */
        }

        if (!cancelled) {
          setLocation({ lat, lng, city, state });
          setLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setError('Não foi possível obter a localização.');
          setLoading(false);
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { location, loading, error };
}
