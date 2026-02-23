import { Injectable } from '@nestjs/common';
import { CachePort } from '@virteex/identity-domain';

@Injectable()
export class LogoutUserUseCase {
  constructor(private readonly cachePort: CachePort) {}

  async execute(sessionId: string): Promise<void> {
    await this.cachePort.del(`session:${sessionId}`);
  }
}
