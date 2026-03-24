import { Injectable, Inject } from '@nestjs/common';
import { SessionRepository, Session } from '@virteex/domain-identity-domain';

@Injectable()
export class GetSessionsUseCase {
  constructor(
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository
  ) {}

  async execute(userId: string): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId);
  }
}
