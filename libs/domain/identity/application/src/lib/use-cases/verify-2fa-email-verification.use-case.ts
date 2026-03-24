import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { UserRepository, CachePort } from '@virteex/domain-identity-domain';

@Injectable()
export class Verify2faEmailVerificationUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(CachePort) private readonly cachePort: CachePort,
  ) {}

  async execute(userId: string, code: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const storedCode = await this.cachePort.get(`2fa:email:${user.id}`);

    if (!storedCode || storedCode !== code) {
        throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.cachePort.del(`2fa:email:${user.id}`);
  }
}
