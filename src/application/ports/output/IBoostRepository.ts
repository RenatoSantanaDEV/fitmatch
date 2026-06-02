import { Boost } from '../../../domain/entities/Boost';
import { BoostTier } from '../../../domain/enums/BoostTier';

export interface CreateBoostInput {
  professionalId: string;
  tier: BoostTier;
  priceInCents: number;
  currency: string;
  stripeCheckoutId: string;
}

export interface IBoostRepository {
  save(input: CreateBoostInput): Promise<Boost>;
  findByStripeCheckoutId(checkoutId: string): Promise<Boost | null>;
  findActiveByProfessionalId(professionalId: string): Promise<Boost | null>;
  activate(id: string, paymentIntentId: string, expiresAt: Date): Promise<void>;
}
