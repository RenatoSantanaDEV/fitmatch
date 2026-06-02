import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StartBoostCheckoutUseCase } from '@/application/use-cases/boost/StartBoostCheckoutUseCase'
import { BoostTier, BOOST_PRICE_CENTS } from '@/domain/enums/BoostTier'
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository'
import type { IBoostRepository } from '@/application/ports/output/IBoostRepository'
import type { IPaymentPort } from '@/application/ports/output/IPaymentPort'
import type { Professional } from '@/domain/entities/Professional'
import type { Boost } from '@/domain/entities/Boost'
import { SessionModality } from '@/domain/enums/SessionModality'
import { BoostStatus } from '@/domain/enums/BoostTier'

function makeProfessional(overrides: Partial<Professional> = {}): Professional {
  return {
    id: 'prof-1',
    userId: 'user-1',
    bio: 'Personal trainer',
    areas: [],
    location: { street: 'Rua A', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '01000-000' },
    modalities: [SessionModality.ONLINE],
    sessionPrice: { min: 80, max: 150, currency: 'BRL' },
    yearsExperience: 3,
    isVerified: false,
    isAcceptingClients: true,
    averageRating: null,
    totalReviews: 0,
    boostTier: null,
    boostExpiresAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

function makeBoost(overrides: Partial<Boost> = {}): Boost {
  return {
    id: 'boost-1',
    professionalId: 'prof-1',
    tier: BoostTier.BASICO,
    priceInCents: 2000,
    currency: 'BRL',
    stripeCheckoutId: 'cs_test_123',
    stripePaymentIntentId: null,
    status: BoostStatus.PENDING,
    expiresAt: null,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }
}

function makeProfessionalRepo(overrides: Partial<IProfessionalRepository> = {}): IProfessionalRepository {
  return {
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByUserId: vi.fn().mockResolvedValue(makeProfessional()),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(makeProfessional()),
    list: vi.fn(),
    updateRating: vi.fn(),
    ...overrides,
  }
}

function makeBoostRepo(overrides: Partial<IBoostRepository> = {}): IBoostRepository {
  return {
    save: vi.fn().mockResolvedValue(makeBoost()),
    findByStripeCheckoutId: vi.fn(),
    findActiveByProfessionalId: vi.fn(),
    activate: vi.fn(),
    ...overrides,
  }
}

function makePaymentPort(overrides: Partial<IPaymentPort> = {}): IPaymentPort {
  return {
    createCheckoutSession: vi.fn().mockResolvedValue({
      checkoutId: 'cs_test_abc',
      checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_abc',
    }),
    constructWebhookEvent: vi.fn(),
    ...overrides,
  }
}

describe('StartBoostCheckoutUseCase', () => {
  let professionalRepo: IProfessionalRepository
  let boostRepo: IBoostRepository
  let paymentPort: IPaymentPort
  let sut: StartBoostCheckoutUseCase

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo()
    boostRepo = makeBoostRepo()
    paymentPort = makePaymentPort()
    sut = new StartBoostCheckoutUseCase(professionalRepo, boostRepo, paymentPort)
  })

  describe('caminho feliz', () => {
    it('retorna checkoutUrl vinda do payment port', async () => {
      const result = await sut.execute({
        userId: 'user-1',
        tier: BoostTier.BASICO,
        baseUrl: 'https://fitconnect.com',
      })

      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_abc')
    })

    it('busca o profissional pelo userId recebido', async () => {
      await sut.execute({ userId: 'user-1', tier: BoostTier.PLUS, baseUrl: 'https://fitconnect.com' })

      expect(professionalRepo.findByUserId).toHaveBeenCalledWith('user-1')
    })

    it('cria sessão de checkout com o tier e professionalId corretos', async () => {
      await sut.execute({ userId: 'user-1', tier: BoostTier.PREMIUM, baseUrl: 'https://fitconnect.com' })

      expect(paymentPort.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: BoostTier.PREMIUM,
          professionalId: 'prof-1',
        }),
      )
    })

    it('passa successUrl e cancelUrl com baseUrl correto', async () => {
      await sut.execute({ userId: 'user-1', tier: BoostTier.BASICO, baseUrl: 'https://fitconnect.com' })

      expect(paymentPort.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          successUrl: expect.stringContaining('https://fitconnect.com/boost/sucesso'),
          cancelUrl: expect.stringContaining('https://fitconnect.com/perfil'),
        }),
      )
    })

    it('salva o boost com status PENDING e priceInCents correto', async () => {
      await sut.execute({ userId: 'user-1', tier: BoostTier.PLUS, baseUrl: 'https://fitconnect.com' })

      expect(boostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          professionalId: 'prof-1',
          tier: BoostTier.PLUS,
          priceInCents: BOOST_PRICE_CENTS[BoostTier.PLUS],
          currency: 'BRL',
          stripeCheckoutId: 'cs_test_abc',
        }),
      )
    })

    it.each([
      [BoostTier.BASICO, 2000],
      [BoostTier.PLUS, 5000],
      [BoostTier.PREMIUM, 10000],
    ])('tier %s tem priceInCents=%i', async (tier, expectedPrice) => {
      await sut.execute({ userId: 'user-1', tier, baseUrl: 'https://fitconnect.com' })

      expect(boostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ priceInCents: expectedPrice }),
      )
    })

    it('salva o boost somente depois de criar a sessão de checkout', async () => {
      const order: string[] = []
      vi.mocked(paymentPort.createCheckoutSession).mockImplementation(async () => {
        order.push('checkout')
        return { checkoutId: 'cs_1', checkoutUrl: 'https://stripe.com/1' }
      })
      vi.mocked(boostRepo.save).mockImplementation(async () => {
        order.push('save')
        return makeBoost()
      })

      await sut.execute({ userId: 'user-1', tier: BoostTier.BASICO, baseUrl: 'https://fitconnect.com' })

      expect(order).toEqual(['checkout', 'save'])
    })
  })

  describe('erros', () => {
    it('lança erro quando profissional não encontrado', async () => {
      vi.mocked(professionalRepo.findByUserId).mockResolvedValue(null)

      await expect(
        sut.execute({ userId: 'nao-existe', tier: BoostTier.BASICO, baseUrl: 'https://fitconnect.com' }),
      ).rejects.toThrow('Perfil profissional não encontrado.')
    })

    it('não chama o payment port quando profissional não existe', async () => {
      vi.mocked(professionalRepo.findByUserId).mockResolvedValue(null)

      await expect(
        sut.execute({ userId: 'nao-existe', tier: BoostTier.BASICO, baseUrl: 'https://fitconnect.com' }),
      ).rejects.toThrow()

      expect(paymentPort.createCheckoutSession).not.toHaveBeenCalled()
    })

    it('não salva boost quando o payment port lança exceção', async () => {
      vi.mocked(paymentPort.createCheckoutSession).mockRejectedValue(new Error('Stripe indisponível'))

      await expect(
        sut.execute({ userId: 'user-1', tier: BoostTier.BASICO, baseUrl: 'https://fitconnect.com' }),
      ).rejects.toThrow('Stripe indisponível')

      expect(boostRepo.save).not.toHaveBeenCalled()
    })
  })
})
