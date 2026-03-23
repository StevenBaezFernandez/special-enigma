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
    // We cannot search by the plain token anymore as it's hashed in the DB.
    // In a real application, we would ideally have a token selector/validator pattern.
    // For now, we'll hash the incoming token and search for an exact match of the hash.
    // Note: This only works if the hashing is deterministic and doesn't use a random salt per call
    // OR if we retrieve the user by some other identifier.
    // Given the current architecture uses argon2 (which is not deterministic for the same input),
    // we MUST use a different approach.

    // IF we had the email in the DTO, it would be easy.
    // Since we DON'T, and we shouldn't iterate all users, let's look at how we can fix this.
    // The previous implementation was:
    // const user = await this.userRepository.findByResetPasswordToken(dto.token);

    // If I cannot change the DB schema, I might have to use a deterministic hash for the LOOKUP,
    // and keep the argon2 hash for the VERIFICATION.

    // However, for this task, I will assume we can update the repository to find by hashed token
    // IF we use a deterministic hash like SHA-256 for the lookup.

    const tokenHash = this.authService.hashToken(dto.token);
    const user = await this.userRepository.findByResetPasswordToken(tokenHash);

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
