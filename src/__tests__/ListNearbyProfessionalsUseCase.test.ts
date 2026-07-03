import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListNearbyProfessionalsUseCase } from '@/application/use-cases/professional/ListNearbyProfessionalsUseCase';
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
    location: { street: 'Rua A', city: 'São Paulo', state: 'SP', country: 'BR', postalCode: '01000-000' },
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
    findBestValue: vi.fn(),
    ...overrides,
  };
}

function makeUserRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findNamesByIds: vi.fn().mockResolvedValue(new Map([['user-1', { name: 'Ana Silva', avatarUrl: null }]])),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailForAuth: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    ...overrides,
  };
}

describe('ListNearbyProfessionalsUseCase', () => {
  let professionalRepo: IProfessionalRepository;
  let userRepo: IUserRepository;
  let sut: ListNearbyProfessionalsUseCase;

  beforeEach(() => {
    professionalRepo = makeProfessionalRepo();
    userRepo = makeUserRepo();
    sut = new ListNearbyProfessionalsUseCase(professionalRepo, userRepo);
  });

  it('usa busca geográfica quando lat/lng são informados', async () => {
    const nearby = makeProfessional({ id: 'prof-nearby' });
    professionalRepo = makeProfessionalRepo({
      list: vi.fn().mockResolvedValue({ data: [nearby], total: 1, page: 1, limit: 8 }),
    });
    sut = new ListNearbyProfessionalsUseCase(professionalRepo, userRepo);

    const result = await sut.execute({ lat: -23.5, lng: -46.6, city: 'São Paulo', state: 'SP' });

    expect(professionalRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        nearLat: -23.5,
        nearLng: -46.6,
        radiusKm: 50,
        isAcceptingClients: true,
      }),
    );
    expect(result.scope).toBe('nearby');
    expect(result.locationLabel).toBe('São Paulo, SP');
    expect(result.professionals).toHaveLength(1);
  });

  it('usa busca por cidade quando não há coordenadas', async () => {
    const local = makeProfessional({ id: 'prof-city' });
    professionalRepo = makeProfessionalRepo({
      list: vi.fn().mockResolvedValue({ data: [local], total: 1, page: 1, limit: 8 }),
    });
    sut = new ListNearbyProfessionalsUseCase(professionalRepo, userRepo);

    const result = await sut.execute({ city: 'Campinas', state: 'SP' });

    expect(professionalRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Campinas',
        state: 'SP',
        cityInsensitive: true,
      }),
    );
    expect(result.scope).toBe('city');
    expect(result.locationLabel).toBe('Campinas, SP');
  });

  it('faz fallback nacional quando não há localização', async () => {
    const national = makeProfessional({ id: 'prof-br' });
    professionalRepo = makeProfessionalRepo({
      list: vi.fn().mockResolvedValue({ data: [national], total: 1, page: 1, limit: 8 }),
    });
    sut = new ListNearbyProfessionalsUseCase(professionalRepo, userRepo);

    const result = await sut.execute();

    expect(professionalRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        isAcceptingClients: true,
        page: 1,
        limit: 8,
      }),
    );
    expect(result.scope).toBe('national');
    expect(result.locationLabel).toBeUndefined();
  });
});
