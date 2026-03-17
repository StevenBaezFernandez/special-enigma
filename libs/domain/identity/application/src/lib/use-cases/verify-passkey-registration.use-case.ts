import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, UserAuthenticator, WebAuthnService } from '@virteex/domain-identity-domain';
import { UnauthorizedException } from '@virteex/kernel-exceptions';
import { RegistrationResponseJSON } from '@simplewebauthn/types';

@Injectable()
export class VerifyPasskeyRegistrationUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(WebAuthnService) private readonly webAuthnService: WebAuthnService
  ) {}

  async execute(userId: string, currentOptions: any, body: RegistrationResponseJSON) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const verification = await this.webAuthnService.verifyRegistrationResponse({
      response: body,
      expectedChallenge: currentOptions.challenge,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      const newAuthenticator = new UserAuthenticator(
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp
      );

      user.authenticators.push(newAuthenticator);
      await this.userRepository.save(user);
      return { verified: true };
    }

    return { verified: false };
  }
}
