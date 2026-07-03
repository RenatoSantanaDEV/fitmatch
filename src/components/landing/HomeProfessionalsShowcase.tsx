'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import type { NearbyScope } from '../../application/use-cases/professional/ListNearbyProfessionalsUseCase';
import { useBrowserGeolocation } from '../../lib/useBrowserGeolocation';
import { OpenAuthModal } from '../auth/OpenAuthModal';
import { HomeProfessionalGridCard } from './HomeProfessionalGridCard';
import type { HomeInitialLocation } from './homeLocationTypes';

interface NearbyApiResponse {
  scope: NearbyScope;
  locationLabel?: string;
  professionals: ProfessionalResponseDTO[];
}

const NEARBY_LIMIT = 6;
const BEST_VALUE_LIMIT = 6;

function hasInitialCoords(location?: HomeInitialLocation): boolean {
  return (
    location?.lat != null &&
    location?.lng != null &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng)
  );
}

function hasInitialCity(location?: HomeInitialLocation): boolean {
  return Boolean(location?.city?.trim());
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-100">
          <div className="aspect-[4/3] skeleton" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-32 rounded skeleton" />
            <div className="h-3 w-full rounded skeleton" />
            <div className="h-3 w-2/3 rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfessionalGrid({
  professionals,
  startIndex = 0,
}: {
  professionals: ProfessionalResponseDTO[];
  startIndex?: number;
}) {
  if (professionals.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {professionals.map((professional, idx) => (
        <HomeProfessionalGridCard
          key={professional.id}
          professional={professional}
          gradientIndex={startIndex + idx}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function HomeProfessionalsShowcase({
  featuredProfessionals,
  initialLocation,
  isAuthenticated,
}: {
  featuredProfessionals: ProfessionalResponseDTO[];
  initialLocation?: HomeInitialLocation;
  isAuthenticated: boolean;
}) {
  const shouldRequestGeo = !hasInitialCoords(initialLocation) && !hasInitialCity(initialLocation);
  const { location: browserLocation, loading: geoLoading } = useBrowserGeolocation(shouldRequestGeo);

  const resolvedLocation = useMemo(() => {
    if (hasInitialCoords(initialLocation)) {
      return {
        lat: initialLocation!.lat,
        lng: initialLocation!.lng,
        city: initialLocation!.city,
        state: initialLocation!.state,
      };
    }
    if (hasInitialCity(initialLocation)) {
      return { city: initialLocation!.city, state: initialLocation!.state };
    }
    if (browserLocation) return browserLocation;
    return null;
  }, [initialLocation, browserLocation]);

  const [nearbyData, setNearbyData] = useState<NearbyApiResponse | null>(null);
  const [bestValue, setBestValue] = useState<ProfessionalResponseDTO[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [bestValueLoading, setBestValueLoading] = useState(true);

  useEffect(() => {
    if (shouldRequestGeo && geoLoading) return;

    let cancelled = false;
    setNearbyLoading(true);

    const params = new URLSearchParams({ limit: String(NEARBY_LIMIT) });
    if (
      resolvedLocation &&
      'lat' in resolvedLocation &&
      resolvedLocation.lat != null &&
      resolvedLocation.lng != null
    ) {
      params.set('lat', String(resolvedLocation.lat));
      params.set('lng', String(resolvedLocation.lng));
    }
    if (resolvedLocation?.city) params.set('city', resolvedLocation.city);
    if (resolvedLocation?.state) params.set('state', resolvedLocation.state);

    fetch(`/api/professionals/nearby?${params}`)
      .then((r) => r.json())
      .then((body: NearbyApiResponse) => {
        if (!cancelled) setNearbyData(body);
      })
      .catch(() => {
        if (!cancelled) setNearbyData({ scope: 'national', professionals: [] });
      })
      .finally(() => {
        if (!cancelled) setNearbyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedLocation, shouldRequestGeo, geoLoading]);

  useEffect(() => {
    let cancelled = false;
    setBestValueLoading(true);

    fetch(`/api/professionals/best-value?limit=${BEST_VALUE_LIMIT}`)
      .then((r) => r.json())
      .then((body: { data?: ProfessionalResponseDTO[] }) => {
        if (!cancelled) setBestValue(body.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setBestValue([]);
      })
      .finally(() => {
        if (!cancelled) setBestValueLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const nearbyScope = nearbyData?.scope ?? 'national';
  const nearbyTitle =
    nearbyScope === 'national' ? 'Profissionais em todo o Brasil' : 'Profissionais perto de você';
  const nearbySubtitle =
    nearbyScope === 'national'
      ? 'Educadores verificados disponíveis em diversas regiões do país'
      : (nearbyData?.locationLabel ?? 'Encontre quem está mais próximo de você');

  const featuredFiltered = featuredProfessionals.slice(0, NEARBY_LIMIT);
  const nearbyList = nearbyData?.professionals ?? [];
  const excludedIds = new Set([
    ...featuredFiltered.map((p) => p.id),
    ...nearbyList.map((p) => p.id),
  ]);
  const bestValueFiltered = bestValue.filter((p) => !excludedIds.has(p.id)).slice(0, BEST_VALUE_LIMIT);

  const hasAnyContent =
    featuredFiltered.length > 0 ||
    nearbyList.length > 0 ||
    bestValueFiltered.length > 0 ||
    nearbyLoading ||
    bestValueLoading;

  const ctaClass =
    'inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover active:scale-[0.98]';

  const isInitialLoading = (shouldRequestGeo && geoLoading) || (nearbyLoading && bestValueLoading);

  if (!hasAnyContent && !isInitialLoading) return null;

  return (
    <section className="border-b border-slate-100 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Nossa comunidade
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Conheça os professores da FitMatch
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
              Perfis verificados, avaliações reais e especialidades para cada objetivo de treino.
            </p>
          </div>
          {isAuthenticated ? (
            <Link href="/descobrir" className={ctaClass}>
              Ver todos os professores
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <OpenAuthModal mode="login" callbackUrl="/descobrir" className={ctaClass}>
              Ver todos os professores
              <ArrowRight className="size-4" aria-hidden />
            </OpenAuthModal>
          )}
        </div>

        <div className="space-y-16">
          {featuredFiltered.length > 0 ? (
            <SectionBlock
              icon={Sparkles}
              title="Profissionais em destaque"
              subtitle="Professores com maior visibilidade"
            >
              <ProfessionalGrid professionals={featuredFiltered} startIndex={0} />
            </SectionBlock>
          ) : null}

          <SectionBlock icon={MapPin} title={nearbyTitle} subtitle={nearbySubtitle}>
            {nearbyLoading || (shouldRequestGeo && geoLoading) ? (
              <GridSkeleton count={NEARBY_LIMIT} />
            ) : nearbyList.length > 0 ? (
              <ProfessionalGrid professionals={nearbyList} startIndex={featuredFiltered.length} />
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
                Novos professores chegando em breve na sua região.
              </p>
            )}
          </SectionBlock>

          {!bestValueLoading && bestValueFiltered.length > 0 ? (
            <SectionBlock
              icon={TrendingUp}
              title="Melhor custo-benefício"
              subtitle="Alta avaliação com preço acessível por aula"
            >
              <ProfessionalGrid
                professionals={bestValueFiltered}
                startIndex={featuredFiltered.length + nearbyList.length}
              />
            </SectionBlock>
          ) : bestValueLoading ? (
            <SectionBlock
              icon={TrendingUp}
              title="Melhor custo-benefício"
              subtitle="Alta avaliação com preço acessível por aula"
            >
              <GridSkeleton count={3} />
            </SectionBlock>
          ) : null}
        </div>
      </div>
    </section>
  );
}
