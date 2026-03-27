import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '@virteex/domain-identity-domain';
import { DomainException } from '@virteex/shared-util-server-server-config';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', 'ENTITY_NOT_FOUND');
    }
    await this.userRepository.delete(userId);
  }
}
