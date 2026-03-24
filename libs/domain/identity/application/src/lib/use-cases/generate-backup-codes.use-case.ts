import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLogRepository, AuditLog } from '@virteex/domain-identity-domain';
import * as crypto from 'crypto';

@Injectable()
export class GenerateBackupCodesUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(userId: string): Promise<{ codes: string[] }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const codes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

    // In production, we should hash these codes before storing them.
    // For now, we simulate storage in the user entity.
    (user as any).backupCodes = codes;
    await this.userRepository.update(user);

    await this.auditLogRepository.save(new AuditLog('BACKUP_CODES_GENERATED', user.id, {}));

    return { codes };
  }
}
