import { SpecializationType } from './SpecializationType';

export interface SpecializationCatalogEntry {
  readonly type: SpecializationType;
  /** Stable, form/URL-safe key shared by the compatibility form and the rank API. */
  readonly id: string;
  readonly label: string;
  /** Matches free-text search queries mentioning this specialization (PT-BR). */
  readonly keywords: RegExp;
}

/**
 * Single source of truth for the specialization taxonomy. Keeps
 * `interpretProfessionalSearch`'s free-text matching, the AI-match form's
 * specialization picker, and the rank API's id→enum mapping in sync —
 * add a specialization here once instead of in three separate places.
 */
export const SPECIALIZATION_CATALOG: readonly SpecializationCatalogEntry[] = [
  {
    type: SpecializationType.PERSONAL_TRAINING,
    id: 'personal',
    label: 'Personal / Funcional',
    keywords: /\b(personal|funcional|muscula[cç][aã]o)\b/i,
  },
  { type: SpecializationType.YOGA, id: 'yoga', label: 'Yoga', keywords: /\b(yoga)\b/i },
  { type: SpecializationType.PILATES, id: 'pilates', label: 'Pilates', keywords: /\b(pilates)\b/i },
  {
    type: SpecializationType.CROSSFIT,
    id: 'crossfit',
    label: 'CrossFit',
    keywords: /\b(cross\s*fit|crossfit)\b/i,
  },
  {
    type: SpecializationType.SWIMMING,
    id: 'natacao',
    label: 'Natação',
    keywords: /\b(nata[cç][aã]o|swim)\b/i,
  },
  {
    type: SpecializationType.MARTIAL_ARTS,
    id: 'lutas',
    label: 'Lutas',
    keywords: /\b(lutas?|muay|boxe|jiu|mma|artes marciais)\b/i,
  },
  { type: SpecializationType.DANCE, id: 'danca', label: 'Dança', keywords: /\b(dan[cç]a|dance)\b/i },
  {
    type: SpecializationType.CYCLING,
    id: 'ciclismo',
    label: 'Ciclismo',
    keywords: /\b(ciclismo|bike)\b/i,
  },
  {
    type: SpecializationType.REHABILITATION,
    id: 'reabilitacao',
    label: 'Reabilitação',
    keywords: /\b(reabilita[cç][aã]o|fisio)\b/i,
  },
  {
    type: SpecializationType.NUTRITION_COACHING,
    id: 'nutricao',
    label: 'Nutrição',
    keywords: /\b(nutri[cç][aã]o|nutricionista)\b/i,
  },
  {
    type: SpecializationType.MEDITATION,
    id: 'meditacao',
    label: 'Meditação',
    keywords: /\b(medita[cç][aã]o|mindfulness)\b/i,
  },
];

export const SPECIALIZATION_BY_ID: ReadonlyMap<string, SpecializationType> = new Map(
  SPECIALIZATION_CATALOG.map((entry) => [entry.id, entry.type]),
);
