import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLogRepository, AuditLog, AuthService } from '@virteex/domain-identity-domain';

export interface SetupMfaResult {
  secret: string;
  otpauthUrl: string;
}

@Injectable()
export class SetupMfaUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(userId: string): Promise<SetupMfaResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', 'NOT_FOUND');
    }

    const secret = this.authService.generateMfaSecret();
    const encryptedSecret = await this.authService.encrypt(secret);

    user.mfaSecret = encryptedSecret;
    user.mfaEnabled = false; // Not enabled until verified

    await this.userRepository.update(user);
    await this.auditLogRepository.save(new AuditLog('MFA_SETUP_INITIATED', user.id, {}));

    const otpauthUrl = `otpauth://totp/Virteex:${user.email}?secret=${secret}&issuer=Virteex`;

    return {
      secret,
      otpauthUrl
    };
  }
}
