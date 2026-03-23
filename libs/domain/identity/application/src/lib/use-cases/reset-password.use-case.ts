import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthService, AuditLogRepository, AuditLog, SessionRepository } from '@virteex/domain-identity-domain';
import { ResetPasswordDto } from '@virteex/domain-identity-contracts';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(dto: ResetPasswordDto, context: { ip: string, userAgent: string }): Promise<void> {
    const user = await this.userRepository.findByResetPasswordToken(dto.token);

    if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset password token');
    }

    const passwordHash = await this.authService.hashPassword(dto.password);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await this.userRepository.save(user);

    // Invalidate all active sessions for this user for security
    await this.sessionRepository.deleteByUserId(user.id);

    await this.auditLogRepository.save(new AuditLog('PASSWORD_RESET_COMPLETED', user.id, context));
  }
}
