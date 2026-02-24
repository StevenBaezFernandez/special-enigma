import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { AuditLog, AuditLogRepository } from '@virteex/identity-domain';
import { SecretManagerService } from '@virteex/auth';
import { createHash } from 'crypto';

@Injectable()
export class MikroOrmAuditLogRepository implements AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: EntityRepository<AuditLog>,
    private readonly secretManager: SecretManagerService
  ) {}

  async save(log: AuditLog): Promise<void> {
    // Use transaction with pessimistic locking to prevent forks in the hash chain
    await this.repository.getEntityManager().transactional(async (em) => {
        // Find last log with write lock
        const lastLog = await em.findOne(AuditLog, {}, {
            orderBy: { timestamp: 'DESC' },
            lockMode: LockMode.PESSIMISTIC_WRITE
        });

        const previousHash = lastLog?.hash || '0'.repeat(64);
        const secret = this.secretManager.getSecret('AUDIT_LOG_PEPPER', 'audit-default-pepper-stable');

        // Deterministic hashing of all critical fields
        const logData = {
            id: log.id,
            userId: log.userId || '',
            event: log.event,
            metadata: log.metadata || {},
            timestamp: log.timestamp.toISOString(),
            previousHash
        };

        const data = JSON.stringify(logData) + secret;
        const hash = createHash('sha256').update(data).digest('hex');

        log.setHash(hash, previousHash);

        await em.persistAndFlush(log);
    });
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    return this.repository.find({ userId });
  }

  async findLast(): Promise<AuditLog | null> {
    return this.repository.findOne({}, { orderBy: { timestamp: 'DESC' } });
  }
}
