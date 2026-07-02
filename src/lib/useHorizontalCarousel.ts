import { useCallback, useEffect, useRef, useState } from 'react';

export const HORIZONTAL_CAROUSEL_GAP_PX = 16;
const DEFAULT_AUTO_PLAY_MS = 5000;

interface CarouselMetrics {
  pageCount: number;
  visibleCount: number;
  canScroll: boolean;
}

function readCarouselMetrics(track: HTMLUListElement, itemCount: number): CarouselMetrics {
  const firstItem = track.children[0] as HTMLElement | undefined;
  if (!firstItem || itemCount === 0) {
    return { pageCount: 1, visibleCount: 1, canScroll: false };
  }

  const stride = firstItem.offsetWidth + HORIZONTAL_CAROUSEL_GAP_PX;
  const visibleCount = Math.max(1, Math.floor((track.clientWidth + HORIZONTAL_CAROUSEL_GAP_PX) / stride));
  const pageCount = Math.max(1, Math.ceil(itemCount / visibleCount));

  return {
    pageCount,
    visibleCount,
    canScroll: pageCount > 1,
  };
}

function readActivePage(track: HTMLUListElement, visibleCount: number): number {
  const firstItem = track.children[0] as HTMLElement | undefined;
  if (!firstItem) return 0;

  const stride = firstItem.offsetWidth + HORIZONTAL_CAROUSEL_GAP_PX;
  const pageStride = visibleCount * stride;
  if (pageStride <= 0) return 0;

  return Math.round(track.scrollLeft / pageStride);
}

interface UseHorizontalCarouselOptions {
  autoPlayIntervalMs?: number;
}

export function useHorizontalCarousel(
  itemCount: number,
  options: UseHorizontalCarouselOptions = {},
) {
  const trackRef = useRef<HTMLUListElement>(null);
  const metricsRef = useRef<CarouselMetrics>({ pageCount: 1, visibleCount: 1, canScroll: false });
  const activePageRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);

  const [activePage, setActivePage] = useState(0);
  const [metrics, setMetrics] = useState<CarouselMetrics>(metricsRef.current);
  const [isPaused, setIsPaused] = useState(false);

  const syncMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const nextMetrics = readCarouselMetrics(track, itemCount);
    metricsRef.current = nextMetrics;
    setMetrics(nextMetrics);

    const clampedPage = Math.min(activePageRef.current, Math.max(0, nextMetrics.pageCount - 1));
    if (clampedPage !== activePageRef.current) {
      activePageRef.current = clampedPage;
      setActivePage(clampedPage);
    }
  }, [itemCount]);

  const scrollToPage = useCallback(
    (page: number, behavior: ScrollBehavior = 'smooth') => {
      const track = trackRef.current;
      if (!track) return;

      const { pageCount, visibleCount } = readCarouselMetrics(track, itemCount);
      const clampedPage = Math.min(Math.max(0, page), Math.max(0, pageCount - 1));
      const firstItem = track.children[0] as HTMLElement | undefined;
      if (!firstItem) return;

      const stride = firstItem.offsetWidth + HORIZONTAL_CAROUSEL_GAP_PX;

      isProgrammaticScrollRef.current = true;
      activePageRef.current = clampedPage;
      setActivePage(clampedPage);

      track.scrollTo({
        left: clampedPage * visibleCount * stride,
        behavior,
      });

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, behavior === 'smooth' ? 450 : 0);
    },
    [itemCount],
  );

  const goToNextPage = useCallback(() => {
    const { pageCount } = metricsRef.current;
    const nextPage = activePageRef.current >= pageCount - 1 ? 0 : activePageRef.current + 1;
    scrollToPage(nextPage);
  }, [scrollToPage]);

  const goToPrevPage = useCallback(() => {
    const { pageCount } = metricsRef.current;
    const prevPage = activePageRef.current <= 0 ? pageCount - 1 : activePageRef.current - 1;
    scrollToPage(prevPage);
  }, [scrollToPage]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncMetrics();
    const observer = new ResizeObserver(syncMetrics);
    observer.observe(track);

    return () => observer.disconnect();
  }, [syncMetrics]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      const { pageCount, visibleCount } = metricsRef.current;
      const page = Math.min(readActivePage(track, visibleCount), Math.max(0, pageCount - 1));

      activePageRef.current = page;
      setActivePage(page);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!metrics.canScroll || isPaused) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const intervalMs = options.autoPlayIntervalMs ?? DEFAULT_AUTO_PLAY_MS;
    const timerId = window.setInterval(goToNextPage, intervalMs);

    return () => window.clearInterval(timerId);
  }, [goToNextPage, isPaused, metrics.canScroll, options.autoPlayIntervalMs]);

  return {
    trackRef,
    activePage,
    pageCount: metrics.pageCount,
    canScroll: metrics.canScroll,
    scrollToPage,
    goToNextPage,
    goToPrevPage,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
  };
}
