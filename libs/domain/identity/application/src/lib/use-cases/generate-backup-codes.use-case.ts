import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, AuditLogRepository, AuditLog, AuthService } from '@virteex/domain-identity-domain';
import * as crypto from 'crypto';

@Injectable()
export class GenerateBackupCodesUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(userId: string): Promise<{ codes: string[] }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const rawCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year expiry

    user.backupCodes = rawCodes.map(code => ({
        hash: this.authService.hashToken(code),
        isUsed: false,
        createdAt: now,
        expiresAt
    }));

    await this.userRepository.update(user);

    await this.auditLogRepository.save(new AuditLog('BACKUP_CODES_GENERATED', user.id, {
        count: rawCodes.length,
        expiresAt
    }));

    // We return raw codes to the user only once upon generation.
    return { codes: rawCodes };
  }
}
