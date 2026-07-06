import type { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/User';
import { makeEmail } from '../../../domain/value-objects/Email';
import { makePhoneNumber } from '../../../domain/value-objects/PhoneNumber';
import { UserRole } from '../../../domain/enums/UserRole';

// Legacy/malformed values may already be stored (validation was added after some
// rows were written) — treat an unparseable stored phone as absent instead of
// throwing, so one bad row can't crash every page that reads this user.
function safePhoneNumber(raw: string | null) {
  if (!raw) return undefined;
  try {
    return makePhoneNumber(raw);
  } catch {
    return undefined;
  }
}

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return {
      id: raw.id,
      email: makeEmail(raw.email),
      name: raw.name,
      phone: safePhoneNumber(raw.phone),
      avatarUrl: raw.avatarUrl ?? raw.image ?? undefined,
      role: raw.role as UserRole,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
