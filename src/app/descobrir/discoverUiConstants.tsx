import type { ElementType } from 'react';
import {
  Activity,
  Dumbbell,
  FlameKindling,
  HeartPulse,
  Monitor,
  PersonStanding,
  Users,
  Wifi,
  Wind,
  Waves,
  Zap,
} from 'lucide-react';
import type { ModalityFilter } from './discoverSearchTypes';

export interface ModalityMenuOption {
  value: Exclude<ModalityFilter, null>;
  label: string;
  icon: ElementType;
  description: string;
}

export const MODALITY_MENU_OPTIONS: ModalityMenuOption[] = [
  {
    value: 'ONLINE',
    label: 'Online',
    icon: Wifi,
    description: 'Aulas por videochamada, de qualquer lugar',
  },
  {
    value: 'IN_PERSON',
    label: 'Presencial',
    icon: Users,
    description: 'Aulas na sua cidade, com localização',
  },
  {
    value: 'HYBRID',
    label: 'Híbrido',
    icon: Monitor,
    description: 'Online e presencial combinados',
  },
];

export interface SpecialtyChipConfig {
  label: string;
  value: string;
  icon: ElementType;
  /** Route slug for the dedicated category listing page */
  slug: string;
}

export const SPECIALTY_CHIP_CONFIGS: SpecialtyChipConfig[] = [
  { label: 'Personal Trainer', value: 'personal trainer', icon: Dumbbell,      slug: 'personal-trainer' },
  { label: 'Pilates',          value: 'pilates',          icon: PersonStanding, slug: 'pilates'          },
  { label: 'CrossFit',         value: 'crossfit',         icon: FlameKindling,  slug: 'crossfit'         },
  { label: 'Yoga',             value: 'yoga',             icon: Wind,           slug: 'yoga'             },
  { label: 'Musculação',       value: 'musculação',       icon: Dumbbell,       slug: 'musculacao'       },
  { label: 'Funcional',        value: 'funcional',        icon: Zap,            slug: 'funcional'        },
  { label: 'Natação',          value: 'natação',          icon: Waves,          slug: 'natacao'          },
  { label: 'Reabilitação',     value: 'reabilitação',     icon: HeartPulse,     slug: 'reabilitacao'     },
  { label: 'Corrida',          value: 'corrida',          icon: Activity,       slug: 'corrida'          },
];

export const PROFESSIONAL_CARD_GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-orange-400 to-amber-600',
  'from-sky-400 to-blue-600',
  'from-rose-400 to-pink-600',
  'from-indigo-400 to-blue-700',
  'from-green-400 to-emerald-600',
  'from-fuchsia-400 to-violet-600',
] as const;
