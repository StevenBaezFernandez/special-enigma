import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLog, AuditLogRepository, WebAuthnService } from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';
import { UnauthorizedException } from '@virteex/kernel-exceptions';
import { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { LoginResponseDto } from '@virteex/domain-identity-contracts';

@Injectable()
export class VerifyPasskeyLoginUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(WebAuthnService) private readonly webAuthnService: WebAuthnService,
    private readonly tokenGenerationService: TokenGenerationService
  ) {}

  async execute(
    body: AuthenticationResponseJSON,
    currentOptions: any,
    context: { ip: string; userAgent: string }
  ): Promise<LoginResponseDto> {
    // Find user by authenticator credential ID (Discovery-based login)
    let user = await this.userRepository.findByAuthenticatorCredentialId(body.id);

    // Fallback to session email if discovery is not used or not supported by client
    if (!user && currentOptions.userEmail) {
      user = await this.userRepository.findByEmail(currentOptions.userEmail);
    }

    if (!user) throw new UnauthorizedException('User not found');

    const authenticator = user.authenticators.find(a => Buffer.from(a.credentialID).toString('base64url') === body.id);
    if (!authenticator) throw new UnauthorizedException('Authenticator not found');

    const verification = await this.webAuthnService.verifyAuthenticationResponse({
      response: body,
      expectedChallenge: currentOptions.challenge,
      authenticator: {
        credentialID: authenticator.credentialID,
        credentialPublicKey: authenticator.publicKey,
        counter: authenticator.counter,
      },
    });

    if (verification.verified) {
      // Update counter
      authenticator.counter = verification.authenticationInfo.newCounter;
      await this.userRepository.save(user);

      const riskScore = 0;
      const { accessToken, refreshToken, expiresIn, session } = await this.tokenGenerationService.createSessionAndTokens(user, context, riskScore);

      await this.auditLogRepository.save(new AuditLog('LOGIN_SUCCESS_PASSKEY', user.id, { ip: context.ip, sessionId: session.id }));

      return {
        accessToken,
        refreshToken,
        expiresIn,
        mfaRequired: false
      };
    }

    throw new UnauthorizedException('Passkey verification failed');
  }
}
