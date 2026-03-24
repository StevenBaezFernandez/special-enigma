import { Injectable, Inject } from '@nestjs/common';
import { CachePort, SessionRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(CachePort) private readonly cachePort: CachePort,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository
  ) {}

  async execute(sessionId: string): Promise<void> {
    await this.cachePort.del(`session:${sessionId}`);
    await this.sessionRepository.delete(sessionId);
  }
}
