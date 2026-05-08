import type { ModalityFilter } from './discoverSearchTypes';

export function augmentQueryWithModalityFilter(
  rawQuery: string,
  modalityFilter: ModalityFilter,
): string {
  const trimmed = rawQuery.trim();
  if (modalityFilter === 'ONLINE') return `${trimmed} online`.trim();
  if (modalityFilter === 'IN_PERSON') return `${trimmed} presencial`.trim();
  if (modalityFilter === 'HYBRID') return `${trimmed} híbrido`.trim();
  return trimmed;
}
