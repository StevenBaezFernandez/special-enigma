import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLogRepository, AuditLog } from '@virteex/domain-identity-domain';

@Injectable()
export class Disable2faUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    user.mfaEnabled = false;
    user.mfaSecret = undefined;

    await this.userRepository.update(user);
    await this.auditLogRepository.save(new AuditLog('MFA_DISABLED', user.id, {}));
  }
}
