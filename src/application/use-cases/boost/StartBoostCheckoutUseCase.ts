import { IBoostRepository } from '../../ports/output/IBoostRepository';
import { IPaymentPort } from '../../ports/output/IPaymentPort';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { BoostTier, BOOST_PRICE_CENTS } from '../../../domain/enums/BoostTier';

export interface StartBoostCheckoutInput {
  userId: string;
  tier: BoostTier;
  baseUrl: string;
}

export interface StartBoostCheckoutOutput {
  checkoutUrl: string;
}

export class StartBoostCheckoutUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly boostRepo: IBoostRepository,
    private readonly paymentPort: IPaymentPort,
  ) {}

  async execute(input: StartBoostCheckoutInput): Promise<StartBoostCheckoutOutput> {
    const professional = await this.professionalRepo.findByUserId(input.userId);
    if (!professional) throw new Error('Perfil profissional não encontrado.');

    const priceInCents = BOOST_PRICE_CENTS[input.tier];

    const { checkoutId, checkoutUrl } = await this.paymentPort.createCheckoutSession({
      tier: input.tier,
      professionalId: professional.id,
      successUrl: `${input.baseUrl}/boost/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${input.baseUrl}/perfil#impulso`,
    });

    await this.boostRepo.save({
      professionalId: professional.id,
      tier: input.tier,
      priceInCents,
      currency: 'BRL',
      stripeCheckoutId: checkoutId,
    });

    return { checkoutUrl };
  }
}
