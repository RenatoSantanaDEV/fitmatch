import { hashSync } from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { SessionModality, SpecializationType, UserRole } from '@prisma/client';
import { UserAlreadyExistsError } from '../../../domain/errors/UserErrors';

export interface RegisterProfessionalAccountDTO {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface RegisterProfessionalAccountResult {
  id: string;
  email: string;
  name: string;
}

export class RegisterProfessionalAccountUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: RegisterProfessionalAccountDTO): Promise<RegisterProfessionalAccountResult> {
    const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (taken) throw new UserAlreadyExistsError(dto.email);

    const passwordHash = hashSync(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
          phone: dto.phone ?? null,
          role: UserRole.PROFESSIONAL,
          isActive: true,
        },
      });

      await tx.professional.create({
        data: {
          userId: u.id,
          bio: '',
          specializations: [SpecializationType.PERSONAL_TRAINING],
          modalities: [SessionModality.HYBRID],
          yearsExperience: 0,
          priceMin: 0,
          priceMax: 0,
          locationStreet: '',
          locationCity: '',
          locationState: '',
          locationCountry: 'Brasil',
          locationPostal: '',
        },
      });

      return u;
    });

    return { id: user.id, email: user.email, name: user.name };
  }
}
