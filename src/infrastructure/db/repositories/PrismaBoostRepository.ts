import { PrismaClient } from '@prisma/client';
import { IBoostRepository, CreateBoostInput } from '../../../application/ports/output/IBoostRepository';
import { Boost } from '../../../domain/entities/Boost';
import { BoostTier, BoostStatus } from '../../../domain/enums/BoostTier';

export class PrismaBoostRepository implements IBoostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(input: CreateBoostInput): Promise<Boost> {
    const raw = await this.prisma.professionalBoost.create({
      data: {
        professionalId: input.professionalId,
        tier: input.tier,
        priceInCents: input.priceInCents,
        currency: input.currency,
        stripeCheckoutId: input.stripeCheckoutId,
        status: 'PENDING',
      },
    });
    return this.toEntity(raw);
  }

  async findByStripeCheckoutId(checkoutId: string): Promise<Boost | null> {
    const raw = await this.prisma.professionalBoost.findUnique({
      where: { stripeCheckoutId: checkoutId },
    });
    return raw ? this.toEntity(raw) : null;
  }

  async findActiveByProfessionalId(professionalId: string): Promise<Boost | null> {
    const now = new Date();
    const raw = await this.prisma.professionalBoost.findFirst({
      where: {
        professionalId,
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'desc' },
    });
    return raw ? this.toEntity(raw) : null;
  }

  async activate(id: string, paymentIntentId: string, expiresAt: Date): Promise<void> {
    await this.prisma.professionalBoost.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        stripePaymentIntentId: paymentIntentId,
        expiresAt,
      },
    });
  }

  private toEntity(raw: {
    id: string;
    professionalId: string;
    tier: string;
    priceInCents: number;
    currency: string;
    stripeCheckoutId: string;
    stripePaymentIntentId: string | null;
    status: string;
    expiresAt: Date | null;
    createdAt: Date;
  }): Boost {
    return {
      id: raw.id,
      professionalId: raw.professionalId,
      tier: raw.tier as BoostTier,
      priceInCents: raw.priceInCents,
      currency: raw.currency,
      stripeCheckoutId: raw.stripeCheckoutId,
      stripePaymentIntentId: raw.stripePaymentIntentId,
      status: raw.status as BoostStatus,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
    };
  }
}
