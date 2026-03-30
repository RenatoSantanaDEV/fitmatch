import { UserRole } from '../../../domain/enums/UserRole';

export interface RegisterUserDTO {
  email: string;
  name: string;
  password: string;
  role: UserRole.STUDENT | UserRole.PROFESSIONAL;
  phone?: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
