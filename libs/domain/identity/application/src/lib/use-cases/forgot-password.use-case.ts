import { Injectable, Inject, Logger } from '@nestjs/common';
import { UserRepository, NotificationService, AuditLogRepository, AuditLog } from '@virteex/domain-identity-domain';
import { ForgotPasswordDto } from '@virteex/domain-identity-contracts';
import { randomBytes } from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(dto: ForgotPasswordDto, context: { ip: string, userAgent: string }): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
      // Return success to avoid user enumeration
      return;
    }

    const token = randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    await this.auditLogRepository.save(new AuditLog('PASSWORD_RESET_REQUESTED', user.id, context));

    await this.notificationService.sendPasswordResetEmail(user, token);
  }
}
