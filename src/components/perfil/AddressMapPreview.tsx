'use client';

import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

function MapPlaceholder({
  title,
  description,
  footnote,
}: {
  title: string;
  description: string;
  footnote?: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/50 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <MapPin className="size-7 text-blue-600" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        {footnote ? (
          <p className="pt-1 text-xs leading-relaxed text-slate-400">{footnote}</p>
        ) : null}
      </div>
    </div>
  );
}

export function AddressMapPreview({
  apiKey,
  latitude,
  longitude,
}: {
  apiKey: string | undefined;
  latitude: number | null;
  longitude: number | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey || latitude == null || longitude == null || !ref.current) return;

    let cancelled = false;
    const el = ref.current;

    void (async () => {
      try {
        setOptions({ key: apiKey, v: 'weekly', language: 'pt-BR', region: 'BR' });
        const { Map } = await importLibrary('maps');
        if (cancelled) return;
        const map = new Map(el, {
          center: { lat: latitude, lng: longitude },
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        await importLibrary('marker');
        if (cancelled) return;
        new google.maps.Marker({
          map,
          position: { lat: latitude, lng: longitude },
        });
      } catch {
        // Mapa é opcional; falha de rede ou CSP aparece só aqui.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiKey, latitude, longitude]);

  if (!apiKey) {
    return (
      <MapPlaceholder
        title="Pré-visualização do mapa"
        description="O mapa interativo ainda não está configurado neste ambiente. O endereço e as coordenadas continuam a funcionar normalmente."
        footnote="Desenvolvimento: defina NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no .env para ativar o mapa."
      />
    );
  }

  if (latitude == null || longitude == null) {
    return (
      <MapPlaceholder
        title="Mapa aparece aqui"
        description="Preencha o endereço e use “Obter coordenadas” abaixo. Depois disso, o mapa mostra o ponto exato."
      />
    );
  }

  return (
    <div
      ref={ref}
      className="h-[min(280px,50vh)] min-h-[200px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner"
    />
  );
}
