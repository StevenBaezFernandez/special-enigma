import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, SessionRepository, CachePort } from '@virteex/domain-identity-domain';
import { DomainException } from '@virteex/shared-util-server-server-config';

@Injectable()
export class BlockUserUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(CachePort) private readonly cachePort: CachePort
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', 'ENTITY_NOT_FOUND');
    }

    user.isActive = false;
    user.status = 'BLOCKED';
    await this.userRepository.save(user);

    // Revoke all sessions
    const sessions = await this.sessionRepository.findByUserId(userId);
    for (const session of sessions) {
      await this.cachePort.del(`session:${session.id}`);
    }
    await this.sessionRepository.deleteByUserId(userId);
  }
}
