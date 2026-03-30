import { type Email } from '../value-objects/Email';
import { type PhoneNumber } from '../value-objects/PhoneNumber';
import { UserRole } from '../enums/UserRole';

export interface User {
  readonly id: string;
  readonly email: Email;
  readonly name: string;
  readonly phone?: PhoneNumber;
  readonly avatarUrl?: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
