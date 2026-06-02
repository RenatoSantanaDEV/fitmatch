import { BoostTier } from '../../../domain/enums/BoostTier';

export interface CreateCheckoutSessionInput {
  tier: BoostTier;
  professionalId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  checkoutId: string;
  checkoutUrl: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface IPaymentPort {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;
  constructWebhookEvent(rawBody: string, signature: string): StripeWebhookEvent;
}
