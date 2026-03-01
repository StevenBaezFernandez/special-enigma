import { Injectable, Inject } from '@nestjs/common';
import { User, UserRepository } from '@virteex/domain-identity-domain';
import { EntityNotFoundException } from '@virteex/kernel-exceptions';
import { UpdateUserDto } from '@virteex/contracts-identity-contracts';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    user.updateProfile(dto.firstName, dto.lastName, dto.phone);

    await this.userRepository.save(user);
    return user;
  }
}
