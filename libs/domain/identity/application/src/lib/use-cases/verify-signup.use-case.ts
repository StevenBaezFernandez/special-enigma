import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { AuthService, CachePort } from '@virteex/domain-identity-domain';
import { VerifySignupDto, VerifySignupResponse } from '@virteex/contracts-identity-contracts';

@Injectable()
export class VerifySignupUseCase {
  constructor(
    @Inject(CachePort) private readonly cachePort: CachePort,
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  async execute(dto: VerifySignupDto): Promise<VerifySignupResponse> {
    const key = `signup:${dto.email}`;
    const payloadStr = await this.cachePort.get(key);

    if (!payloadStr) {
      throw new DomainException('OTP expired or invalid', 'UNAUTHORIZED');
    }

    let payload: { otp: string; passwordHash: string; timestamp: number };
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      throw new DomainException('Invalid payload', 'UNAUTHORIZED');
    }

    if (payload.otp !== dto.otp) {
        throw new DomainException('Invalid OTP', 'BAD_REQUEST');
    }

    await this.cachePort.set(key, payloadStr, 3600);

    const onboardingToken = await this.authService.generateToken({
        email: dto.email,
        scope: 'onboarding',
        verified: true
    });

    return { onboardingToken };
  }
}
