import { Injectable, Inject } from '@nestjs/common';
import { EntityNotFoundException } from "@virteex/kernel-exceptions";
import { UnauthorizedException } from '@virteex/kernel-exceptions';
import { UserRepository, AuditLogRepository, AuditLog } from '@virteex/domain-identity-domain';
import { TokenGenerationService } from '../services/token-generation.service';

@Injectable()
export class ImpersonateUserUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    private readonly tokenGenerationService: TokenGenerationService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(adminUserId: string, targetUserId: string, context: { ip: string; userAgent: string }): Promise<any> {
    const adminUser = await this.userRepository.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new UnauthorizedException('Only admins can impersonate');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new UnauthorizedException('Target user not found');
    }

    const result = await this.tokenGenerationService.createSessionAndTokens(targetUser, context);

    await this.auditLogRepository.save(new AuditLog('IMPERSONATION_STARTED', adminUserId, { targetUserId }));

    return result;
  }
}
