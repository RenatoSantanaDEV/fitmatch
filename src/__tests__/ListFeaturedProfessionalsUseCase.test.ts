import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListFeaturedProfessionalsUseCase } from '@/application/use-cases/professional/ListFeaturedProfessionalsUseCase'
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
    list: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 8 }),
    updateRating: vi.fn(),
    countActive: vi.fn(),
    findFeatured: vi.fn().mockResolvedValue([]),
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

describe('ListFeaturedProfessionalsUseCase', () => {
  let professionalRepo: IProfessionalRepository
  let userRepo: IUserRepository
  let sut: ListFeaturedProfessionalsUseCase

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo()
    userRepo = makeUserRepo()
    sut = new ListFeaturedProfessionalsUseCase(professionalRepo, userRepo)
  })

  describe('com profissionais impulsionados', () => {
    it('retorna os profissionais de findFeatured (já ordenados por tier)', async () => {
      const premium = makeProfessional({ id: 'prof-premium', boostTier: BoostTier.PREMIUM })
      const basico = makeProfessional({ id: 'prof-basico', boostTier: BoostTier.BASICO })
      professionalRepo = makeProfessionalRepo({ findFeatured: vi.fn().mockResolvedValue([premium, basico]) })
      sut = new ListFeaturedProfessionalsUseCase(professionalRepo, userRepo)

      const result = await sut.execute({ limit: 8 })

      expect(result.map((p) => p.id)).toEqual(['prof-premium', 'prof-basico'])
      expect(professionalRepo.list).not.toHaveBeenCalled()
    })
  })

  describe('sem ninguém impulsionado', () => {
    it('cai para a listagem padrão (melhor avaliados) em vez de retornar vazio', async () => {
      professionalRepo = makeProfessionalRepo({
        findFeatured: vi.fn().mockResolvedValue([]),
        list: vi.fn().mockResolvedValue({ data: [makeProfessional({ id: 'prof-top-rated' })], total: 1, page: 1, limit: 8 }),
      })
      sut = new ListFeaturedProfessionalsUseCase(professionalRepo, userRepo)

      const result = await sut.execute({ limit: 8 })

      expect(result.map((p) => p.id)).toEqual(['prof-top-rated'])
      expect(professionalRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ isAcceptingClients: true, limit: 8 }),
      )
    })
  })

  describe('limite', () => {
    it('usa o limite padrão quando nenhum é passado', async () => {
      await sut.execute()

      expect(professionalRepo.findFeatured).toHaveBeenCalledWith(8)
    })

    it('respeita o teto máximo mesmo se um limite maior for pedido', async () => {
      await sut.execute({ limit: 50 })

      expect(professionalRepo.findFeatured).toHaveBeenCalledWith(10)
    })
  })
})
