import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListBestValueProfessionalsUseCase } from '@/application/use-cases/professional/ListBestValueProfessionalsUseCase';
import type { IProfessionalRepository } from '@/application/ports/output/IProfessionalRepository';
import type { IUserRepository } from '@/application/ports/output/IUserRepository';
import type { Professional } from '@/domain/entities/Professional';
import { SessionModality } from '@/domain/enums/SessionModality';

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
  };
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
    findFeatured: vi.fn(),
    findBestValue: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
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
  };
}

describe('ListBestValueProfessionalsUseCase', () => {
  let professionalRepo: IProfessionalRepository;
  let userRepo: IUserRepository;
  let sut: ListBestValueProfessionalsUseCase;

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo();
    userRepo = makeUserRepo();
    sut = new ListBestValueProfessionalsUseCase(professionalRepo, userRepo);
  });

  it('retorna profissionais de findBestValue', async () => {
    const best = makeProfessional({ id: 'prof-best', userId: 'user-best' });
    professionalRepo = makeProfessionalRepo({
      findBestValue: vi.fn().mockResolvedValue([best]),
    });
    userRepo = makeUserRepo({
      findNamesByIds: vi.fn().mockResolvedValue(new Map([['user-best', { name: 'Carlos', avatarUrl: null }]])),
    });
    sut = new ListBestValueProfessionalsUseCase(professionalRepo, userRepo);

    const result = await sut.execute({ limit: 8 });

    expect(professionalRepo.findBestValue).toHaveBeenCalledWith(8);
    expect(professionalRepo.list).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Carlos');
  });

  it('faz fallback para list quando findBestValue retorna vazio', async () => {
    const fallback = makeProfessional({ id: 'prof-fallback', userId: 'user-fb' });
    professionalRepo = makeProfessionalRepo({
      findBestValue: vi.fn().mockResolvedValue([]),
      list: vi.fn().mockResolvedValue({ data: [fallback], total: 1, page: 1, limit: 8 }),
    });
    userRepo = makeUserRepo({
      findNamesByIds: vi.fn().mockResolvedValue(new Map([['user-fb', { name: 'Diana', avatarUrl: null }]])),
    });
    sut = new ListBestValueProfessionalsUseCase(professionalRepo, userRepo);

    const result = await sut.execute();

    expect(professionalRepo.list).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Diana');
  });
});
