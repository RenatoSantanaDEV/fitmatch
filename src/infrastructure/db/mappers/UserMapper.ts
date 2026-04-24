import type { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/User';
import { makeEmail } from '../../../domain/value-objects/Email';
import { makePhoneNumber } from '../../../domain/value-objects/PhoneNumber';
import { UserRole } from '../../../domain/enums/UserRole';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return {
      id: raw.id,
      email: makeEmail(raw.email),
      name: raw.name,
      phone: raw.phone ? makePhoneNumber(raw.phone) : undefined,
      avatarUrl: raw.avatarUrl ?? raw.image ?? undefined,
      role: raw.role as UserRole,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
