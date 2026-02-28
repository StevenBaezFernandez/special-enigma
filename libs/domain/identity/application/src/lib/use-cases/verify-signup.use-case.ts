import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
      throw new UnauthorizedException('OTP expired or invalid');
    }

    let payload: { otp: string; passwordHash: string; timestamp: number };
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      throw new UnauthorizedException('Invalid payload');
    }

    if (payload.otp !== dto.otp) {
        throw new BadRequestException('Invalid OTP');
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
