import { hashSync } from 'bcryptjs';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { RegisterUserDTO, UserResponseDTO } from '../../dtos/user/RegisterUserDTO';
import { makeEmail } from '../../../domain/value-objects/Email';
import { UserAlreadyExistsError } from '../../../domain/errors/UserErrors';

export class RegisterUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<UserResponseDTO> {
    const email = makeEmail(dto.email);

    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const passwordHash = hashSync(dto.password, 12);

    const user = await this.userRepo.save(
      {
        email,
        name: dto.name,
        role: dto.role,
        isActive: true,
        phone: dto.phone as never,
        avatarUrl: undefined,
      },
      passwordHash,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
