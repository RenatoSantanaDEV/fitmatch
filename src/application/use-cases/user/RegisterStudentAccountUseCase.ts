import { hashSync } from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { UserAlreadyExistsError } from '../../../domain/errors/UserErrors';
import { defaultStudentUncheckedCreateInput } from '../../../infrastructure/auth/defaultStudentProfile';

export interface RegisterStudentAccountDTO {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface RegisterStudentAccountResult {
  id: string;
  email: string;
  name: string;
}

export class RegisterStudentAccountUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: RegisterStudentAccountDTO): Promise<RegisterStudentAccountResult> {
    const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (taken) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const passwordHash = hashSync(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
          phone: dto.phone ?? null,
          role: UserRole.STUDENT,
          isActive: true,
        },
      });
      await tx.student.create({
        data: defaultStudentUncheckedCreateInput(u.id),
      });
      return u;
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
