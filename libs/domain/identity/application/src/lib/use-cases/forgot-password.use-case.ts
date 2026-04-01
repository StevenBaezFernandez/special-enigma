import { Injectable, Inject, Logger } from '@nestjs/common';
import { EntityNotFoundException } from "@virteex/kernel-exceptions";
import { UserRepository, NotificationService, AuditLogRepository, AuditLog, AuthService } from '@virteex/domain-identity-domain';
import { ForgotPasswordDto } from '@virteex/domain-identity-contracts';
import { randomBytes } from 'crypto';
import { BadRequestException } from '@virteex/kernel-exceptions';
import { RecaptchaPort } from '@virteex/domain-identity-domain';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RecaptchaPort) private readonly recaptchaService: RecaptchaPort,
  ) {}

  async execute(dto: ForgotPasswordDto, context: { ip: string, userAgent: string }, bypassRecaptcha = false): Promise<void> {
    if (!bypassRecaptcha && !(await this.recaptchaService.verify(dto.recaptchaToken, 'forgotPassword'))) {
        throw new BadRequestException('reCAPTCHA verification failed');
    }

    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
      // Return success to avoid user enumeration
      return;
    }

    const token = randomBytes(32).toString('hex');
    user.resetPasswordToken = this.authService.hashToken(token);
    user.resetPasswordExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    await this.auditLogRepository.save(new AuditLog('PASSWORD_RESET_REQUESTED', user.id, context));

    await this.notificationService.sendPasswordResetEmail(user, token);
  }
}
