'use client';

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import { cn } from '../../lib/cn';
import { HORIZONTAL_CAROUSEL_GAP_PX, useHorizontalCarousel } from '../../lib/useHorizontalCarousel';
import { FeaturedProfessionalCard } from './FeaturedProfessionalCard';

interface FeaturedProfessionalsCarouselProps {
  professionals: ProfessionalResponseDTO[];
  title?: string;
  subtitle?: string;
}

const navButtonClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40';

export function FeaturedProfessionalsCarousel({
  professionals,
  title = 'Profissionais em destaque',
  subtitle,
}: FeaturedProfessionalsCarouselProps) {
  const {
    trackRef,
    activePage,
    pageCount,
    canScroll,
    scrollToPage,
    goToNextPage,
    goToPrevPage,
    pause,
    resume,
  } = useHorizontalCarousel(professionals.length);

  if (professionals.length === 0) return null;

  return (
    <section
      className="w-full"
      aria-roledescription="carrossel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          resume();
        }
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
              <Sparkles className="size-4 text-brand" aria-hidden />
            </span>
            <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              {title}
            </h2>
          </div>
          {subtitle ? (
            <p className="mt-1 pl-[2.625rem] text-xs leading-relaxed text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        {canScroll ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className={navButtonClass}
              aria-label="Profissionais anteriores"
              onClick={goToPrevPage}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className={navButtonClass}
              aria-label="Próximos profissionais"
              onClick={goToNextPage}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <ul
        ref={trackRef}
        className="flex overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ gap: HORIZONTAL_CAROUSEL_GAP_PX }}
        aria-label={title}
      >
        {professionals.map((professional, idx) => (
          <li key={professional.id} className="list-none snap-start">
            <FeaturedProfessionalCard professional={professional} gradientIndex={idx} />
          </li>
        ))}
      </ul>

      {canScroll ? (
        <div
          className="mt-4 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Navegação do carrossel"
        >
          {Array.from({ length: pageCount }, (_, pageIndex) => {
            const isActive = pageIndex === activePage;

            return (
              <button
                key={pageIndex}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Ir para a página ${pageIndex + 1} de ${pageCount}`}
                onClick={() => scrollToPage(pageIndex)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                  isActive ? 'w-7 bg-brand' : 'w-1.5 bg-slate-300 hover:bg-slate-400',
                )}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
