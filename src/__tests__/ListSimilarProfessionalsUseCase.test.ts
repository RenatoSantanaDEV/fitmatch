import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListSimilarProfessionalsUseCase } from '@/application/use-cases/professional/ListSimilarProfessionalsUseCase'
import { BoostTier } from '@/domain/enums/BoostTier'
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository'
import type { IUserRepository } from '@/application/ports/output/IUserRepository'
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
    averageRating: 4.5,
    totalReviews: 10,
    boostTier: null,
    boostExpiresAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

function makeProfessionalRepo(overrides: Partial<IProfessionalRepository> = {}): IProfessionalRepository {
  return {
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    list: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 6 }),
    updateRating: vi.fn(),
    countActive: vi.fn(),
    findFeatured: vi.fn(),
    ...overrides,
  }
}

function makeUserRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findNamesByIds: vi.fn().mockResolvedValue(new Map()),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailForAuth: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    ...overrides,
  }
}

describe('ListSimilarProfessionalsUseCase', () => {
  let professionalRepo: IProfessionalRepository
  let userRepo: IUserRepository
  let sut: ListSimilarProfessionalsUseCase

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo()
    userRepo = makeUserRepo()
    sut = new ListSimilarProfessionalsUseCase(professionalRepo, userRepo)
  })

  describe('exclusão do próprio profissional', () => {
    it('remove o profissional visto da lista de resultados', async () => {
      const self = makeProfessional({ id: 'prof-self' })
      const other = makeProfessional({ id: 'prof-other' })
      professionalRepo = makeProfessionalRepo({
        list: vi.fn().mockResolvedValue({ data: [self, other], total: 2, page: 1, limit: 7 }),
      })
      sut = new ListSimilarProfessionalsUseCase(professionalRepo, userRepo)

      const result = await sut.execute({ excludeProfessionalId: 'prof-self', specializationSlugs: ['YOGA'] })

      expect(result.map((p) => p.id)).toEqual(['prof-other'])
    })
  })

  describe('priorização de impulsionados', () => {
    it('herda a ordenação boost-first já aplicada por list()', async () => {
      const boosted = makeProfessional({ id: 'prof-boosted', boostTier: BoostTier.PREMIUM })
      const normal = makeProfessional({ id: 'prof-normal' })
      professionalRepo = makeProfessionalRepo({
        list: vi.fn().mockResolvedValue({ data: [boosted, normal], total: 2, page: 1, limit: 7 }),
      })
      sut = new ListSimilarProfessionalsUseCase(professionalRepo, userRepo)

      const result = await sut.execute({ excludeProfessionalId: 'prof-self', specializationSlugs: ['YOGA'] })

      expect(result.map((p) => p.id)).toEqual(['prof-boosted', 'prof-normal'])
    })
  })

  describe('fallback quando a especialidade não tem resultados suficientes', () => {
    it('complementa com uma busca ampla (sem filtro de especialidade)', async () => {
      const fromSpecialty = makeProfessional({ id: 'prof-specialty' })
      const fromBroad = makeProfessional({ id: 'prof-broad' })
      const list = vi.fn()
        .mockResolvedValueOnce({ data: [fromSpecialty], total: 1, page: 1, limit: 7 })
        .mockResolvedValueOnce({ data: [fromSpecialty, fromBroad], total: 2, page: 1, limit: 7 })
      professionalRepo = makeProfessionalRepo({ list })
      sut = new ListSimilarProfessionalsUseCase(professionalRepo, userRepo)

      const result = await sut.execute({ excludeProfessionalId: 'prof-self', specializationSlugs: ['YOGA'], limit: 6 })

      expect(result.map((p) => p.id)).toEqual(['prof-specialty', 'prof-broad'])
      expect(list).toHaveBeenCalledTimes(2)
    })
  })
})
