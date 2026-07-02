import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetProfessionalInsightsUseCase } from '@/application/use-cases/professional/GetProfessionalInsightsUseCase'
import { ProfessionalNotFoundError } from '@/domain/errors/ProfessionalErrors'
import { BoostTier, BoostStatus } from '@/domain/enums/BoostTier'
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository'
import type { IProfileViewRepository } from '@/application/ports/output/IProfileViewRepository'
import type { IMatchRepository } from '@/application/ports/output/IMatchRepository'
import type { ISessionRepository } from '@/application/ports/output/ISessionRepository'
import type { IBoostRepository } from '@/application/ports/output/IBoostRepository'
import type { PrismaStudentFavoriteRepository } from '@/infrastructure/db/repositories/PrismaStudentFavoriteRepository'
import type { Professional } from '@/domain/entities/Professional'
import type { Boost } from '@/domain/entities/Boost'
import type { Session } from '@/domain/entities/Session'
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
    stripePaymentIntentId: 'pi_123',
    status: BoostStatus.ACTIVE,
    expiresAt: new Date('2024-02-01'),
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
    update: vi.fn(),
    list: vi.fn(),
    updateRating: vi.fn(),
    countActive: vi.fn().mockResolvedValue(10),
    findFeatured: vi.fn(),
    ...overrides,
  }
}

function makeProfileViewRepo(overrides: Partial<IProfileViewRepository> = {}): IProfileViewRepository {
  return {
    recordView: vi.fn(),
    countTotal: vi.fn().mockResolvedValue(0),
    countInRange: vi.fn().mockResolvedValue(0),
    countAllInRange: vi.fn().mockResolvedValue(0),
    ...overrides,
  }
}

function makeMatchRepo(overrides: Partial<IMatchRepository> = {}): IMatchRepository {
  return {
    findById: vi.fn(),
    findByStudentId: vi.fn(),
    findActiveByStudentAndProfessional: vi.fn(),
    save: vi.fn(),
    saveMany: vi.fn(),
    updateStatus: vi.fn(),
    countReceivedByProfessional: vi.fn().mockResolvedValue(0),
    countReceivedByProfessionalInRange: vi.fn().mockResolvedValue(0),
    ...overrides,
  }
}

function makeSessionRepo(overrides: Partial<ISessionRepository> = {}): ISessionRepository {
  return {
    findById: vi.fn(),
    findByStudentId: vi.fn(),
    findByProfessionalId: vi.fn().mockResolvedValue([] as Session[]),
    save: vi.fn(),
    updateStatus: vi.fn(),
    ...overrides,
  }
}

function makeBoostRepo(overrides: Partial<IBoostRepository> = {}): IBoostRepository {
  return {
    save: vi.fn(),
    findByStripeCheckoutId: vi.fn(),
    findActiveByProfessionalId: vi.fn().mockResolvedValue(null),
    activate: vi.fn(),
    ...overrides,
  }
}

function makeStudentFavoriteRepo(
  overrides: Partial<PrismaStudentFavoriteRepository> = {},
): PrismaStudentFavoriteRepository {
  return {
    countReceivedByProfessional: vi.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as PrismaStudentFavoriteRepository
}

describe('GetProfessionalInsightsUseCase', () => {
  let professionalRepo: IProfessionalRepository
  let profileViewRepo: IProfileViewRepository
  let studentFavoriteRepo: PrismaStudentFavoriteRepository
  let matchRepo: IMatchRepository
  let sessionRepo: ISessionRepository
  let boostRepo: IBoostRepository
  let sut: GetProfessionalInsightsUseCase

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo()
    profileViewRepo = makeProfileViewRepo()
    studentFavoriteRepo = makeStudentFavoriteRepo()
    matchRepo = makeMatchRepo()
    sessionRepo = makeSessionRepo()
    boostRepo = makeBoostRepo()
    sut = new GetProfessionalInsightsUseCase(
      professionalRepo,
      profileViewRepo,
      studentFavoriteRepo,
      matchRepo,
      sessionRepo,
      boostRepo,
    )
  })

  describe('profissional não encontrado', () => {
    it('lança ProfessionalNotFoundError', async () => {
      vi.mocked(professionalRepo.findByUserId).mockResolvedValue(null)

      await expect(sut.execute({ professionalUserId: 'user-1' })).rejects.toThrow(ProfessionalNotFoundError)
    })
  })

  describe('tier FREE (sem impulso ativo)', () => {
    it('retorna apenas views, sem funil nem comparações', async () => {
      profileViewRepo = makeProfileViewRepo({
        countTotal: vi.fn().mockResolvedValue(42),
        countInRange: vi.fn().mockResolvedValue(10),
      })
      sut = new GetProfessionalInsightsUseCase(professionalRepo, profileViewRepo, studentFavoriteRepo, matchRepo, sessionRepo, boostRepo)

      const result = await sut.execute({ professionalUserId: 'user-1' })

      expect(result.tierUnlocked).toBe('FREE')
      expect(result.isBoostActive).toBe(false)
      expect(result.totalViews).toBe(42)
      expect(result.viewsLast30Days).toBe(10)
      expect(result.funnel).toBeNull()
      expect(result.conversionRates).toBeNull()
      expect(result.platformComparison).toBeNull()
      expect(result.boostEffectiveness).toBeNull()
    })
  })

  describe('tier BASICO', () => {
    it('libera o funil mas não conversões nem comparações', async () => {
      boostRepo = makeBoostRepo({ findActiveByProfessionalId: vi.fn().mockResolvedValue(makeBoost({ tier: BoostTier.BASICO })) })
      studentFavoriteRepo = makeStudentFavoriteRepo({ countReceivedByProfessional: vi.fn().mockResolvedValue(5) })
      matchRepo = makeMatchRepo({ countReceivedByProfessional: vi.fn().mockResolvedValue(3) })
      sessionRepo = makeSessionRepo({ findByProfessionalId: vi.fn().mockResolvedValue([{}, {}] as Session[]) })
      sut = new GetProfessionalInsightsUseCase(professionalRepo, profileViewRepo, studentFavoriteRepo, matchRepo, sessionRepo, boostRepo)

      const result = await sut.execute({ professionalUserId: 'user-1' })

      expect(result.tierUnlocked).toBe('BASICO')
      expect(result.funnel).toEqual({ views: 0, favorites: 5, matches: 3, bookings: 2 })
      expect(result.conversionRates).toBeNull()
      expect(result.platformComparison).toBeNull()
      expect(result.boostEffectiveness).toBeNull()
    })
  })

  describe('tier PLUS', () => {
    it('libera taxas de conversão além do funil', async () => {
      boostRepo = makeBoostRepo({ findActiveByProfessionalId: vi.fn().mockResolvedValue(makeBoost({ tier: BoostTier.PLUS })) })
      profileViewRepo = makeProfileViewRepo({ countTotal: vi.fn().mockResolvedValue(100), countInRange: vi.fn().mockResolvedValue(20) })
      studentFavoriteRepo = makeStudentFavoriteRepo({ countReceivedByProfessional: vi.fn().mockResolvedValue(10) })
      matchRepo = makeMatchRepo({ countReceivedByProfessional: vi.fn().mockResolvedValue(5) })
      sessionRepo = makeSessionRepo({ findByProfessionalId: vi.fn().mockResolvedValue([{}] as Session[]) })
      sut = new GetProfessionalInsightsUseCase(professionalRepo, profileViewRepo, studentFavoriteRepo, matchRepo, sessionRepo, boostRepo)

      const result = await sut.execute({ professionalUserId: 'user-1' })

      expect(result.tierUnlocked).toBe('PLUS')
      expect(result.conversionRates).toEqual({
        viewToFavoritePct: 10,
        favoriteToMatchPct: 50,
        matchToBookingPct: 20,
        overallViewToBookingPct: 1,
      })
      expect(result.platformComparison).toBeNull()
      expect(result.boostEffectiveness).toBeNull()
    })

    it('taxas de conversão não quebram com divisão por zero', async () => {
      boostRepo = makeBoostRepo({ findActiveByProfessionalId: vi.fn().mockResolvedValue(makeBoost({ tier: BoostTier.PLUS })) })
      sut = new GetProfessionalInsightsUseCase(professionalRepo, profileViewRepo, studentFavoriteRepo, matchRepo, sessionRepo, boostRepo)

      const result = await sut.execute({ professionalUserId: 'user-1' })

      expect(result.conversionRates).toEqual({
        viewToFavoritePct: 0,
        favoriteToMatchPct: 0,
        matchToBookingPct: 0,
        overallViewToBookingPct: 0,
      })
    })
  })

  describe('tier PREMIUM', () => {
    it('libera comparação com a plataforma e efetividade do impulso', async () => {
      const boost = makeBoost({ tier: BoostTier.PREMIUM, createdAt: new Date('2024-01-01T00:00:00Z') })
      boostRepo = makeBoostRepo({ findActiveByProfessionalId: vi.fn().mockResolvedValue(boost) })
      profileViewRepo = makeProfileViewRepo({
        countTotal: vi.fn().mockResolvedValue(50),
        countInRange: vi.fn().mockResolvedValue(15),
        countAllInRange: vi.fn().mockResolvedValue(100),
      })
      professionalRepo = makeProfessionalRepo({ countActive: vi.fn().mockResolvedValue(20) })
      sut = new GetProfessionalInsightsUseCase(professionalRepo, profileViewRepo, studentFavoriteRepo, matchRepo, sessionRepo, boostRepo)

      const result = await sut.execute({ professionalUserId: 'user-1' })

      expect(result.tierUnlocked).toBe('PREMIUM')
      expect(result.platformComparison).toEqual({
        yourViewsLast30Days: 15,
        platformAvgViewsLast30Days: 5,
        percentileHint: 'above',
        sampleSize: 20,
      })
      expect(result.boostEffectiveness).not.toBeNull()
      expect(result.boostEffectiveness?.boostTier).toBe('PREMIUM')
      expect(result.boostEffectiveness?.boostStartedAt).toEqual(boost.createdAt)
    })

    it('mostra aviso de amostra pequena quando há poucos profissionais ativos', async () => {
      boostRepo = makeBoostRepo({ findActiveByProfessionalId: vi.fn().mockResolvedValue(makeBoost({ tier: BoostTier.PREMIUM })) })
      professionalRepo = makeProfessionalRepo({ countActive: vi.fn().mockResolvedValue(2) })
      sut = new GetProfessionalInsightsUseCase(professionalRepo, profileViewRepo, studentFavoriteRepo, matchRepo, sessionRepo, boostRepo)

      const result = await sut.execute({ professionalUserId: 'user-1' })

      expect(result.platformComparison?.sampleSize).toBe(2)
    })
  })
})
