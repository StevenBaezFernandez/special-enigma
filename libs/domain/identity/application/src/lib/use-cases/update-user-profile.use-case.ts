import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { User, UserRepository } from '@virteex/domain-identity-domain';
import { UpdateUserDto } from '@virteex/domain-identity-contracts';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', 'ENTITY_NOT_FOUND');
    }

    user.updateProfile(dto.firstName, dto.lastName, dto.phone);

    await this.userRepository.save(user);
    return user;
  }
}
