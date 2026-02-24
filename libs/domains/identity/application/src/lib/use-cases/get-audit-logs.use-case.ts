import { Injectable, Inject } from '@nestjs/common';
import { AuditLogRepository, AuditLog } from '@virteex/identity-domain';

@Injectable()
export class GetAuditLogsUseCase {
  constructor(
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.findByUserId(userId);
  }
}
