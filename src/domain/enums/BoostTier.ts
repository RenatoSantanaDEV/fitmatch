export enum BoostTier {
  BASICO = 'BASICO',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
}

export enum BoostStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export const BOOST_DURATION_DAYS: Record<BoostTier, number> = {
  [BoostTier.BASICO]: 7,
  [BoostTier.PLUS]: 15,
  [BoostTier.PREMIUM]: 30,
};

export const BOOST_PRICE_CENTS: Record<BoostTier, number> = {
  [BoostTier.BASICO]: 2000,
  [BoostTier.PLUS]: 5000,
  [BoostTier.PREMIUM]: 10000,
};

export const BOOST_LABEL: Record<BoostTier, string> = {
  [BoostTier.BASICO]: 'Destaque',
  [BoostTier.PLUS]: 'Destaque+',
  [BoostTier.PREMIUM]: 'Super Destaque',
};
