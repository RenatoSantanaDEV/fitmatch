'use client';

import { Loader2, MapPin, Navigation, X } from 'lucide-react';
import type { ModalityFilter } from './discoverSearchTypes';
import { MODALITY_MENU_OPTIONS } from './discoverUiConstants';

const RATING_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Qualquer avaliação', value: null },
  { label: '3 estrelas ou mais', value: 3 },
  { label: '4 estrelas ou mais', value: 4 },
  { label: '4,5 estrelas ou mais', value: 4.5 },
];

interface FilterSidebarProps {
  cityInput: string;
  stateInput: string;
  onCityChange: (v: string) => void;
  onStateChange: (v: string) => void;
  isGeoLoading: boolean;
  geoHint: string | null;
  locationError: string | null;
  onUseMyLocation: () => void;
  modalityFilter: ModalityFilter;
  onModalityChange: (v: ModalityFilter) => void;
  minRating: number | null;
  onMinRatingChange: (v: number | null) => void;
  maxPrice: string;
  onMaxPriceChange: (v: string) => void;
  acceptingOnly: boolean;
  onAcceptingOnlyChange: (v: boolean) => void;
  onClear: () => void;
  isDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function OptionRow({
  checked,
  onChange,
  name,
  label,
  type = 'radio',
}: {
  checked: boolean;
  onChange: () => void;
  name: string;
  label: string;
  type?: 'radio' | 'checkbox';
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
        checked
          ? 'bg-emerald-50 font-medium text-emerald-700'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-emerald-600"
      />
      {label}
    </label>
  );
}

function SidebarContent({
  cityInput,
  stateInput,
  onCityChange,
  onStateChange,
  isGeoLoading,
  geoHint,
  locationError,
  onUseMyLocation,
  modalityFilter,
  onModalityChange,
  minRating,
  onMinRatingChange,
  maxPrice,
  onMaxPriceChange,
  acceptingOnly,
  onAcceptingOnlyChange,
  onClear,
}: Omit<FilterSidebarProps, 'isDrawer' | 'isOpen' | 'onClose'>) {
  return (
    <div className="flex flex-col gap-5">

      {/* Localização */}
      <div>
        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Localização
        </h3>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100">
          <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden />
          <input
            value={cityInput}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Cidade"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="h-4 w-px bg-slate-200 shrink-0" aria-hidden />
          <input
            value={stateInput}
            onChange={(e) => onStateChange(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="UF"
            maxLength={2}
            className="w-8 bg-transparent text-center text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={isGeoLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {isGeoLoading ? (
            <Loader2 className="size-3.5 animate-spin text-emerald-600" aria-hidden />
          ) : (
            <Navigation className="size-3.5 text-emerald-600" aria-hidden />
          )}
          {isGeoLoading ? 'Localizando…' : 'Usar minha localização'}
        </button>
        {geoHint && !locationError && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600">
            <Navigation className="size-3 shrink-0" aria-hidden />
            {geoHint}
          </p>
        )}
        {locationError && (
          <p className="mt-1.5 text-[11px] text-red-500">{locationError}</p>
        )}
      </div>

      <div className="h-px bg-slate-100" />

      {/* Modalidade */}
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Tipo de aula
        </h3>
        <div className="flex flex-col gap-0.5">
          <OptionRow
            name="modality"
            label="Qualquer modalidade"
            checked={modalityFilter === null}
            onChange={() => onModalityChange(null)}
          />
          {MODALITY_MENU_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              name="modality"
              label={opt.label}
              checked={modalityFilter === opt.value}
              onChange={() => onModalityChange(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Avaliação mínima */}
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Avaliação
        </h3>
        <div className="flex flex-col gap-0.5">
          {RATING_OPTIONS.map((opt) => (
            <OptionRow
              key={String(opt.value)}
              name="minRating"
              label={opt.label}
              checked={minRating === opt.value}
              onChange={() => onMinRatingChange(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Faixa de preço */}
      <div>
        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Faixa de preço
        </h3>
        <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100 overflow-hidden">
          <span className="shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            Até R$
          </span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="500"
            className="min-w-0 flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <span className="shrink-0 border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            /aula
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Aceita novos alunos */}
      <OptionRow
        name="acceptingOnly"
        type="checkbox"
        label="Aceita novos alunos"
        checked={acceptingOnly}
        onChange={() => onAcceptingOnlyChange(!acceptingOnly)}
      />

      {/* Limpar */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

export function FilterSidebar({
  isDrawer = false,
  isOpen = false,
  onClose,
  ...rest
}: FilterSidebarProps) {
  if (!isDrawer) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Filtros</h2>
          <button
            type="button"
            onClick={rest.onClear}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Limpar todos
          </button>
        </div>
        <SidebarContent {...rest} />
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Filtros</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar filtros"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="p-5">
          <SidebarContent {...rest} />
        </div>
      </div>
    </>
  );
}
