import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecordProfileViewUseCase } from '@/application/use-cases/professional/RecordProfileViewUseCase'
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository'
import type { IProfileViewRepository } from '@/application/ports/output/IProfileViewRepository'
import type { Professional } from '@/domain/entities/Professional'
import { SessionModality } from '@/domain/enums/SessionModality'

function makeProfessional(overrides: Partial<Professional> = {}): Professional {
  return {
    id: 'prof-1',
    userId: 'user-owner',
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

function makeProfessionalRepo(overrides: Partial<IProfessionalRepository> = {}): IProfessionalRepository {
  return {
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByUserId: vi.fn().mockResolvedValue(makeProfessional()),
    save: vi.fn(),
    update: vi.fn(),
    list: vi.fn(),
    updateRating: vi.fn(),
    countActive: vi.fn(),
    findFeatured: vi.fn(),
    ...overrides,
  }
}

function makeProfileViewRepo(overrides: Partial<IProfileViewRepository> = {}): IProfileViewRepository {
  return {
    recordView: vi.fn().mockResolvedValue({ recorded: true }),
    countTotal: vi.fn(),
    countInRange: vi.fn(),
    countAllInRange: vi.fn(),
    ...overrides,
  }
}

describe('RecordProfileViewUseCase', () => {
  let professionalRepo: IProfessionalRepository
  let profileViewRepo: IProfileViewRepository
  let sut: RecordProfileViewUseCase

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo()
    profileViewRepo = makeProfileViewRepo()
    sut = new RecordProfileViewUseCase(professionalRepo, profileViewRepo)
  })

  describe('caminho feliz', () => {
    it('registra a visualização com o professionalId resolvido do dono do perfil', async () => {
      await sut.execute({ profileOwnerUserId: 'user-owner', viewerUserId: 'user-viewer' })

      expect(profileViewRepo.recordView).toHaveBeenCalledWith({
        professionalId: 'prof-1',
        viewerUserId: 'user-viewer',
      })
    })
  })

  describe('auto-visualização', () => {
    it('não registra quando o próprio dono visualiza o perfil', async () => {
      await sut.execute({ profileOwnerUserId: 'user-owner', viewerUserId: 'user-owner' })

      expect(professionalRepo.findByUserId).not.toHaveBeenCalled()
      expect(profileViewRepo.recordView).not.toHaveBeenCalled()
    })
  })

  describe('profissional não encontrado', () => {
    it('não registra e não lança erro quando o dono do perfil não é um profissional', async () => {
      vi.mocked(professionalRepo.findByUserId).mockResolvedValue(null)

      await expect(
        sut.execute({ profileOwnerUserId: 'user-owner', viewerUserId: 'user-viewer' }),
      ).resolves.toBeUndefined()
      expect(profileViewRepo.recordView).not.toHaveBeenCalled()
    })
  })
})
