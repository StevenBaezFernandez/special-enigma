import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthService, AuditLogRepository, AuditLog } from '@virteex/domain-identity-domain';
import { SetPasswordDto } from '@virteex/domain-identity-contracts';

@Injectable()
export class SetPasswordUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(dto: SetPasswordDto, context: { ip: string, userAgent: string }): Promise<void> {
    const user = await this.userRepository.findByInvitationToken(dto.token);

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
