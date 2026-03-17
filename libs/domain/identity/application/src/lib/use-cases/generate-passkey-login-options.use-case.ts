import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, WebAuthnService } from '@virteex/domain-identity-domain';
import { UnauthorizedException } from '@virteex/kernel-exceptions';

@Injectable()
export class GeneratePasskeyLoginOptionsUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(WebAuthnService) private readonly webAuthnService: WebAuthnService
  ) {}

  async execute(email?: string) {
    let allowCredentials = undefined;

    if (email) {
      const user = await this.userRepository.findByEmail(email);
      if (user && user.authenticators.length > 0) {
        allowCredentials = user.authenticators.map(auth => ({
          id: auth.credentialID,
          type: 'public-key' as const,
          transports: auth.transports as any,
        }));
      }
    }

    return this.webAuthnService.generateAuthenticationOptions({
      allowCredentials,
      userVerification: 'preferred',
    });
  }
}
