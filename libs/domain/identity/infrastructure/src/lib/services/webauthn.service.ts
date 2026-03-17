import { Injectable } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { SecretManagerService } from '@virteex/kernel-auth';

@Injectable()
export class WebAuthnService {
  private readonly rpName: string;
  private readonly rpID: string;
  private readonly origin: string;

  constructor(private readonly secretManager: SecretManagerService) {
    this.rpName = this.secretManager.getSecret('WEBAUTHN_RP_NAME', 'Virteex ERP');
    this.rpID = this.secretManager.getSecret('WEBAUTHN_RP_ID', 'localhost');
    this.origin = this.secretManager.getSecret('WEBAUTHN_ORIGIN', 'http://localhost:4200');
  }

  async generateRegistrationOptions(options: Partial<GenerateRegistrationOptionsOpts>) {
    return generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      ...options,
    } as GenerateRegistrationOptionsOpts);
  }

  async verifyRegistrationResponse(options: VerifyRegistrationResponseOpts) {
    return verifyRegistrationResponse({
      expectedRPID: this.rpID,
      expectedOrigin: this.origin,
      ...options,
    });
  }

  async generateAuthenticationOptions(options: Partial<GenerateAuthenticationOptionsOpts>) {
    return generateAuthenticationOptions({
      rpID: this.rpID,
      ...options,
    } as GenerateAuthenticationOptionsOpts);
  }

  async verifyAuthenticationResponse(options: VerifyAuthenticationResponseOpts) {
    return verifyAuthenticationResponse({
      expectedRPID: this.rpID,
      expectedOrigin: this.origin,
      ...options,
    });
  }
}
