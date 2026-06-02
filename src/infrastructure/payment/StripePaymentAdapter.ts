import Stripe from 'stripe';
import { IPaymentPort, CreateCheckoutSessionInput, CheckoutSessionResult, StripeWebhookEvent } from '../../application/ports/output/IPaymentPort';
import { BoostTier, BOOST_PRICE_CENTS, BOOST_LABEL, BOOST_DURATION_DAYS } from '../../domain/enums/BoostTier';

const TIER_DESCRIPTIONS: Record<BoostTier, string> = {
  [BoostTier.BASICO]: '7 dias de destaque na plataforma',
  [BoostTier.PLUS]: '15 dias de destaque+ na plataforma',
  [BoostTier.PREMIUM]: '30 dias de super destaque na plataforma',
};

export class StripePaymentAdapter implements IPaymentPort {
  private readonly stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY não está configurado.');
    const priceInCents = BOOST_PRICE_CENTS[input.tier];
    const label = BOOST_LABEL[input.tier];
    const days = BOOST_DURATION_DAYS[input.tier];
    const description = TIER_DESCRIPTIONS[input.tier];

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: priceInCents,
            product_data: {
              name: `FitConnect ${label}`,
              description: `${description} (${days} dias)`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        professionalId: input.professionalId,
        tier: input.tier,
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });

    return {
      checkoutId: session.id,
      checkoutUrl: session.url!,
    };
  }

  constructWebhookEvent(rawBody: string, signature: string): StripeWebhookEvent {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET não está configurado.');
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    return {
      type: event.type,
      data: { object: event.data.object as unknown as Record<string, unknown> },
    };
  }
}
