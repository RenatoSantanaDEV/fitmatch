import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListFavoriteProfessionalsUseCase } from '@/application/use-cases/professional/ListFavoriteProfessionalsUseCase'
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository'
import type { IUserRepository } from '@/application/ports/output/IUserRepository'
import type { IStudentFavoriteRepository } from '@/application/ports/output/IStudentFavoriteRepository'
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
    findByIds: vi.fn().mockResolvedValue([]),
    findByUserId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    list: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 }),
    updateRating: vi.fn(),
    countActive: vi.fn(),
    findFeatured: vi.fn(),
    findBestValue: vi.fn(),
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

function makeStudentFavoriteRepo(overrides: Partial<IStudentFavoriteRepository> = {}): IStudentFavoriteRepository {
  return {
    listProfessionalIds: vi.fn().mockResolvedValue([]),
    toggle: vi.fn(),
    countReceivedByProfessional: vi.fn(),
    ...overrides,
  }
}

describe('ListFavoriteProfessionalsUseCase', () => {
  let studentFavoriteRepo: IStudentFavoriteRepository
  let professionalRepo: IProfessionalRepository
  let userRepo: IUserRepository
  let sut: ListFavoriteProfessionalsUseCase

  beforeEach(() => {
    studentFavoriteRepo = makeStudentFavoriteRepo()
    professionalRepo = makeProfessionalRepo()
    userRepo = makeUserRepo()
    sut = new ListFavoriteProfessionalsUseCase(studentFavoriteRepo, professionalRepo, userRepo)
  })

  describe('sem favoritos', () => {
    it('retorna lista vazia sem consultar profissionais ou nomes', async () => {
      const result = await sut.execute({ studentId: 'student-1' })

      expect(result).toEqual([])
      expect(professionalRepo.findByIds).not.toHaveBeenCalled()
      expect(userRepo.findNamesByIds).not.toHaveBeenCalled()
    })
  })

  describe('com favoritos', () => {
    it('retorna os profissionais favoritados com nome e avatar anexados', async () => {
      studentFavoriteRepo = makeStudentFavoriteRepo({
        listProfessionalIds: vi.fn().mockResolvedValue(['prof-1', 'prof-2']),
      })
      const profOne = makeProfessional({ id: 'prof-1', userId: 'user-1' })
      const profTwo = makeProfessional({ id: 'prof-2', userId: 'user-2' })
      professionalRepo = makeProfessionalRepo({
        findByIds: vi.fn().mockResolvedValue([profOne, profTwo]),
      })
      userRepo = makeUserRepo({
        findNamesByIds: vi.fn().mockResolvedValue(
          new Map([
            ['user-1', { name: 'Ana', avatarUrl: null }],
            ['user-2', { name: 'Bruno', avatarUrl: '/avatar-bruno.png' }],
          ]),
        ),
      })
      sut = new ListFavoriteProfessionalsUseCase(studentFavoriteRepo, professionalRepo, userRepo)

      const result = await sut.execute({ studentId: 'student-1' })

      expect(result.map((p) => p.id)).toEqual(['prof-1', 'prof-2'])
      expect(result.map((p) => p.displayName)).toEqual(['Ana', 'Bruno'])
      expect(result[1].avatarUrl).toBe('/avatar-bruno.png')
    })
  })

  describe('profissional favoritado removido da plataforma', () => {
    it('retorna apenas os profissionais que ainda existem, sem lançar erro', async () => {
      studentFavoriteRepo = makeStudentFavoriteRepo({
        listProfessionalIds: vi.fn().mockResolvedValue(['prof-1', 'prof-deleted']),
      })
      const stillExists = makeProfessional({ id: 'prof-1', userId: 'user-1' })
      professionalRepo = makeProfessionalRepo({
        findByIds: vi.fn().mockResolvedValue([stillExists]),
      })
      sut = new ListFavoriteProfessionalsUseCase(studentFavoriteRepo, professionalRepo, userRepo)

      const result = await sut.execute({ studentId: 'student-1' })

      expect(result.map((p) => p.id)).toEqual(['prof-1'])
    })
  })
})
