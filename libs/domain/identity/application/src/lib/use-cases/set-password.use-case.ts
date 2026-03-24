import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthService, AuditLogRepository, AuditLog, RecaptchaPort } from '@virteex/domain-identity-domain';
import { SetPasswordDto } from '@virteex/domain-identity-contracts';

@Injectable()
export class SetPasswordUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(RecaptchaPort) private readonly recaptchaService: RecaptchaPort
  ) {}

  async execute(dto: SetPasswordDto, context: { ip: string, userAgent: string }): Promise<void> {
    if (!(await this.recaptchaService.verify(dto.recaptchaToken, 'setPassword'))) {
        throw new BadRequestException('reCAPTCHA verification failed');
    }

    const tokenHash = this.authService.hashToken(dto.token);
    const user = await this.userRepository.findByInvitationToken(tokenHash);

    if (!user || !user.invitationExpiresAt || user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    const passwordHash = await this.authService.hashPassword(dto.password);
    user.passwordHash = passwordHash;
    user.invitationToken = undefined;
    user.invitationExpiresAt = undefined;
    user.activate();

    await this.userRepository.save(user);

    await this.auditLogRepository.save(new AuditLog('USER_INVITATION_ACCEPTED', user.id, context));
  }
}
