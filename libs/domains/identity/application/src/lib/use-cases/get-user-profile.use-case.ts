import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User, UserRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
