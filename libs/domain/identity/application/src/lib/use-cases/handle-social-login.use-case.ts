import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLog, AuditLogRepository } from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';
import { LoginResponseDto } from '@virteex/domain-identity-contracts';
import { UnauthorizedException } from '@virteex/kernel-exceptions';

export interface SocialProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: 'google' | 'microsoft' | 'okta';
}

@Injectable()
export class HandleSocialLoginUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    private readonly tokenGenerationService: TokenGenerationService
  ) {}

  async execute(profile: SocialProfile, context: { ip: string; userAgent: string }): Promise<LoginResponseDto> {
    let user = await this.userRepository.findBySocialId(profile.provider, profile.id);

    if (!user) {
      // Try to link by email if user exists but hasn't linked this provider
      user = await this.userRepository.findByEmail(profile.email);

      if (user) {
        if (profile.provider === 'google') user.googleId = profile.id;
        else if (profile.provider === 'microsoft') user.microsoftId = profile.id;
        else if (profile.provider === 'okta') user.oktaId = profile.id;

        await this.userRepository.save(user);
        await this.auditLogRepository.save(new AuditLog('SOCIAL_ACCOUNT_LINKED', user.id, { provider: profile.provider, ip: context.ip }));
      } else {
        // Here we could choose to auto-register or throw.
        // Given "Haz que sea funcional", let's assume registration is required or handled elsewhere.
        // For robustness, let's throw if user not found, or ideally we'd have a SignupSocialUseCase.
        // Let's implement a simple auto-registration if company exists (or handle error).
        throw new UnauthorizedException('Social account not linked to any user. Please register first.');
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const riskScore = 0; // Social login usually lowers risk or is handled by provider
    const { accessToken, refreshToken, expiresIn, session } = await this.tokenGenerationService.createSessionAndTokens(user, context, riskScore);

    await this.auditLogRepository.save(new AuditLog('LOGIN_SUCCESS_SOCIAL', user.id, { provider: profile.provider, ip: context.ip, sessionId: session.id }));

    return {
      accessToken,
      refreshToken,
      expiresIn,
      mfaRequired: false
    };
  }
}
