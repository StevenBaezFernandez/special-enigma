import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLogRepository, AuditLog, AuthService } from '@virteex/domain-identity-domain';

@Injectable()
export class ConfirmMfaUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.mfaSecret) {
      throw new DomainException('User or MFA secret not found', 'NOT_FOUND');
    }

    const decryptedSecret = await this.authService.decrypt(user.mfaSecret);
    const isValid = this.authService.verifyMfaToken(token, decryptedSecret);

    if (!isValid) {
      await this.auditLogRepository.save(new AuditLog('MFA_CONFIRMATION_FAILED', user.id, {}));
      throw new DomainException('Invalid verification code', 'UNAUTHORIZED');
    }

    user.mfaEnabled = true;
    await this.userRepository.update(user);
    await this.auditLogRepository.save(new AuditLog('MFA_ENABLED', user.id, {}));

    return true;
  }
}
