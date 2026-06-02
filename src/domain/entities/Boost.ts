import { BoostTier, BoostStatus } from '../enums/BoostTier';

export interface Boost {
  readonly id: string;
  readonly professionalId: string;
  readonly tier: BoostTier;
  readonly priceInCents: number;
  readonly currency: string;
  readonly stripeCheckoutId: string;
  readonly stripePaymentIntentId: string | null;
  readonly status: BoostStatus;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;
}
