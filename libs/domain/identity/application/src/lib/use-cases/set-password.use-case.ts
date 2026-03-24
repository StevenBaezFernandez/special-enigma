import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthService, AuditLogRepository, AuditLog, RecaptchaPort } from '@virteex/domain-identity-domain';
import { SetPasswordDto, LoginResponseDto } from '@virteex/domain-identity-contracts';
import { TokenGenerationService } from '../services/token-generation.service';

@Injectable()
export class SetPasswordUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(RecaptchaPort) private readonly recaptchaService: RecaptchaPort,
    private readonly tokenGenerationService: TokenGenerationService
  ) {}

  async execute(dto: SetPasswordDto, context: { ip: string, userAgent: string }): Promise<LoginResponseDto> {
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

    const { accessToken, refreshToken, expiresIn } = await this.tokenGenerationService.createSessionAndTokens(user, context, 0);

    return {
        accessToken,
        refreshToken,
        expiresIn,
        mfaRequired: false
    };
  }
}
