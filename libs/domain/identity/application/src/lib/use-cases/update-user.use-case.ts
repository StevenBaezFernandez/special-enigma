import { Injectable, Inject } from '@nestjs/common';
import { User, UserRepository } from '@virteex/domain-identity-domain';
import { UpdateUserDto } from '@virteex/domain-identity-contracts';
import { DomainException } from '@virteex/shared-util-server-server-config';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string, dto: UpdateUserDto, tenantId?: string): Promise<User> {
    const user = await this.userRepository.findById(userId, tenantId);
    if (!user) {
      throw new DomainException('User not found', 'ENTITY_NOT_FOUND');
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.preferredLanguage) user.preferredLanguage = dto.preferredLanguage;
    if (dto.status) user.status = dto.status;

    await this.userRepository.save(user);
    return user;
  }
}
