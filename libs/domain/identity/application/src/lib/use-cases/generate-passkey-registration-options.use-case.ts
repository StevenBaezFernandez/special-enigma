import { Injectable, Inject } from '@nestjs/common';
import { EntityNotFoundException } from "@virteex/kernel-exceptions";
import { UserRepository, WebAuthnService } from '@virteex/domain-identity-domain';
import { UnauthorizedException } from '@virteex/kernel-exceptions';

@Injectable()
export class GeneratePasskeyRegistrationOptionsUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(WebAuthnService) private readonly webAuthnService: WebAuthnService
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.webAuthnService.generateRegistrationOptions({
      userID: user.id,
      userName: user.email,
      userDisplayName: `${user.firstName} ${user.lastName}`,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      excludeCredentials: user.authenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
      })),
    });
  }
}
