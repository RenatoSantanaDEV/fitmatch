import { User } from '../../../domain/entities/User';
import { type Email } from '../../../domain/value-objects/Email';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByEmailForAuth(email: string): Promise<{ user: User; passwordHash: string | null } | null>;
  save(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, passwordHash: string): Promise<User>;
  update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User>;
  deactivate(id: string): Promise<void>;
}
