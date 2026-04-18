import { PrismaClient, Prisma } from '@prisma/client';
import { IUserRepository } from '../../../application/ports/output/IUserRepository';
import { User } from '../../../domain/entities/User';
import { type Email } from '../../../domain/value-objects/Email';
import { UserAlreadyExistsError } from '../../../domain/errors/UserErrors';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmailForAuth(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return { user: UserMapper.toDomain(raw), passwordHash: raw.passwordHash };
  }

  async save(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, passwordHash: string): Promise<User> {
    try {
      const raw = await this.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isActive: user.isActive,
        },
      });
      return UserMapper.toDomain(raw);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new UserAlreadyExistsError(user.email);
      }
      throw err;
    }
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const raw = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive,
      },
    });
    return UserMapper.toDomain(raw);
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
