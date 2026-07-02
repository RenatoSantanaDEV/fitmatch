import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ActivateBoostUseCase } from '@/application/use-cases/boost/ActivateBoostUseCase'
import { BoostTier, BoostStatus, BOOST_DURATION_DAYS } from '@/domain/enums/BoostTier'
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository'
import type { IBoostRepository } from '@/application/ports/output/IBoostRepository'
import type { Boost } from '@/domain/entities/Boost'
import type { Professional } from '@/domain/entities/Professional'
import { SessionModality } from '@/domain/enums/SessionModality'

function makeProfessional(overrides: Partial<Professional> = {}): Professional {
  return {
    id: 'prof-1',
    userId: 'user-1',
    bio: 'Bio',
    areas: [],
    location: { street: 'Rua A', city: 'SP', state: 'SP', country: 'BR', postalCode: '01000-000' },
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

function makeBoostRepo(overrides: Partial<IBoostRepository> = {}): IBoostRepository {
  return {
    save: vi.fn(),
    findByStripeCheckoutId: vi.fn().mockResolvedValue(makeBoost()),
    findActiveByProfessionalId: vi.fn(),
    activate: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function makeProfessionalRepo(overrides: Partial<IProfessionalRepository> = {}): IProfessionalRepository {
  return {
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(makeProfessional()),
    list: vi.fn(),
    updateRating: vi.fn(),
    countActive: vi.fn(),
    findFeatured: vi.fn(),
    ...overrides,
  }
}

describe('ActivateBoostUseCase', () => {
  let boostRepo: IBoostRepository
  let professionalRepo: IProfessionalRepository
  let sut: ActivateBoostUseCase

  beforeEach(() => {
    boostRepo = makeBoostRepo()
    professionalRepo = makeProfessionalRepo()
    sut = new ActivateBoostUseCase(boostRepo, professionalRepo)
  })

  describe('caminho feliz', () => {
    it('ativa o boost via boostRepo.activate', async () => {
      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_abc' })

      expect(boostRepo.activate).toHaveBeenCalledWith('boost-1', 'pi_abc', expect.any(Date))
    })

    it('atualiza o profissional com boostTier e boostExpiresAt', async () => {
      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_abc' })

      expect(professionalRepo.update).toHaveBeenCalledWith(
        'prof-1',
        expect.objectContaining({
          boostTier: BoostTier.BASICO,
          boostExpiresAt: expect.any(Date),
        }),
      )
    })

    it.each([
      [BoostTier.BASICO, BOOST_DURATION_DAYS.BASICO],
      [BoostTier.PLUS, BOOST_DURATION_DAYS.PLUS],
      [BoostTier.PREMIUM, BOOST_DURATION_DAYS.PREMIUM],
    ])('tier %s define expiresAt com %d dias no futuro', async (tier, days) => {
      vi.mocked(boostRepo.findByStripeCheckoutId).mockResolvedValue(makeBoost({ tier }))
      const before = new Date()

      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_abc' })

      const [, , expiresAt] = vi.mocked(boostRepo.activate).mock.calls[0] as [string, string, Date]
      const diffDays = Math.round((expiresAt.getTime() - before.getTime()) / (1000 * 60 * 60 * 24))
      expect(diffDays).toBe(days)
    })

    it('expiresAt passado ao professionalRepo.update é o mesmo passado ao boostRepo.activate', async () => {
      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_abc' })

      const [, , activateExpiry] = vi.mocked(boostRepo.activate).mock.calls[0] as [string, string, Date]
      const updateCall = vi.mocked(professionalRepo.update).mock.calls[0][1] as { boostExpiresAt: Date }
      expect(updateCall.boostExpiresAt.getTime()).toBe(activateExpiry.getTime())
    })
  })

  describe('idempotência', () => {
    it('não reativa boost já com status ACTIVE', async () => {
      vi.mocked(boostRepo.findByStripeCheckoutId).mockResolvedValue(
        makeBoost({ status: BoostStatus.ACTIVE }),
      )

      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_abc' })

      expect(boostRepo.activate).not.toHaveBeenCalled()
      expect(professionalRepo.update).not.toHaveBeenCalled()
    })
  })

  describe('boost não encontrado', () => {
    it('retorna sem errar quando checkout não existe no banco', async () => {
      vi.mocked(boostRepo.findByStripeCheckoutId).mockResolvedValue(null)

      await expect(
        sut.execute({ stripeCheckoutId: 'cs_invalido', stripePaymentIntentId: 'pi_abc' }),
      ).resolves.toBeUndefined()
    })

    it('não chama activate nem update quando boost não encontrado', async () => {
      vi.mocked(boostRepo.findByStripeCheckoutId).mockResolvedValue(null)

      await sut.execute({ stripeCheckoutId: 'cs_invalido', stripePaymentIntentId: 'pi_abc' })

      expect(boostRepo.activate).not.toHaveBeenCalled()
      expect(professionalRepo.update).not.toHaveBeenCalled()
    })
  })

  describe('fluxo de chamadas', () => {
    it('busca boost pelo stripeCheckoutId fornecido', async () => {
      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_abc' })

      expect(boostRepo.findByStripeCheckoutId).toHaveBeenCalledWith('cs_test_123')
    })

    it('passa paymentIntentId correto ao boostRepo.activate', async () => {
      await sut.execute({ stripeCheckoutId: 'cs_test_123', stripePaymentIntentId: 'pi_xyz_999' })

      expect(boostRepo.activate).toHaveBeenCalledWith('boost-1', 'pi_xyz_999', expect.any(Date))
    })
  })
})
