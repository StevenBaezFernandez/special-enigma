import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { UserRepository, AuthService, AuditLogRepository, AuditLog, SessionRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository
  ) {}

  async execute(userId: string, dto: any): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    // Since we are likely using OIDC/Keycloak in production as per audit,
    // this might be handled there, but for the Argon2 fallback or internal management:
    const isValid = await this.authService.verifyPassword(dto.oldPassword, user.passwordHash);
    if (!isValid) {
        throw new UnauthorizedException('Invalid old password');
    }

    user.passwordHash = await this.authService.hashPassword(dto.newPassword);
    await this.userRepository.save(user);

    // Invalidate other sessions
    await this.sessionRepository.deleteByUserId(user.id);

    await this.auditLogRepository.save(new AuditLog('PASSWORD_CHANGED', user.id, {}));
  }
}
