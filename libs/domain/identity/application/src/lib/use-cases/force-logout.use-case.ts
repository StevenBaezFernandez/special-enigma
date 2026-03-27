import { Injectable, Inject } from '@nestjs/common';
import { SessionRepository, CachePort } from '@virteex/domain-identity-domain';

@Injectable()
export class ForceLogoutUseCase {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(CachePort) private readonly cachePort: CachePort
  ) {}

  async execute(userId: string): Promise<void> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    for (const session of sessions) {
      await this.cachePort.del(`session:${session.id}`);
    }
    await this.sessionRepository.deleteByUserId(userId);
  }
}
