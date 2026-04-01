import { Injectable, Inject } from '@nestjs/common';
import { EntityNotFoundException } from "@virteex/kernel-exceptions";
import { UnauthorizedException } from '@virteex/kernel-exceptions';
import { SessionRepository, CachePort } from '@virteex/domain-identity-domain';

@Injectable()
export class RevokeSessionUseCase {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(CachePort) private readonly cachePort: CachePort
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.user.id !== userId) {
      throw new UnauthorizedException('Session not found or not owned by user');
    }

    await this.cachePort.del(`session:${sessionId}`);
    await this.sessionRepository.delete(sessionId);
  }
}
