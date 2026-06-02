import { type NextRequest, NextResponse } from 'next/server';
import { activateBoostUseCase, paymentAdapter } from '../../../../container';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: ReturnType<typeof paymentAdapter.constructWebhookEvent>;
  try {
    event = paymentAdapter.constructWebhookEvent(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object;
    const checkoutId = checkoutSession['id'] as string;
    const paymentIntentId = (checkoutSession['payment_intent'] as string | null) ?? '';

    try {
      await activateBoostUseCase.execute({ stripeCheckoutId: checkoutId, stripePaymentIntentId: paymentIntentId });
    } catch (err) {
      console.error('[stripe-webhook] ActivateBoostUseCase error:', err);
      return NextResponse.json({ error: 'Internal error processing payment.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
