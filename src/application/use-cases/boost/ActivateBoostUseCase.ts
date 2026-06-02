import { IBoostRepository } from '../../ports/output/IBoostRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { BOOST_DURATION_DAYS } from '../../../domain/enums/BoostTier';

export interface ActivateBoostInput {
  stripeCheckoutId: string;
  stripePaymentIntentId: string;
}

export class ActivateBoostUseCase {
  constructor(
    private readonly boostRepo: IBoostRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(input: ActivateBoostInput): Promise<void> {
    const boost = await this.boostRepo.findByStripeCheckoutId(input.stripeCheckoutId);
    if (!boost) return;
    if (boost.status === 'ACTIVE') return;

    const durationDays = BOOST_DURATION_DAYS[boost.tier];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await this.boostRepo.activate(boost.id, input.stripePaymentIntentId, expiresAt);

    await this.professionalRepo.update(boost.professionalId, {
      boostTier: boost.tier,
      boostExpiresAt: expiresAt,
    });
  }
}
