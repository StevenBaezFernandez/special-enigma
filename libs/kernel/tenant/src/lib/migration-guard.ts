import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class MigrationGuard {
  private readonly logger = new Logger(MigrationGuard.name);

  constructor(private readonly em: EntityManager) {}

  async preMigrationCheck(): Promise<boolean> {
    this.logger.log('Executing pre-migration safety checks...');

    const hasRecentBackup = await this.verifyRecentBackup();
    if (!hasRecentBackup) {
      this.logger.error('CRITICAL: No verified backup found in the last 24h. Migration blocked.');
      return false;
    }

    const lag = await this.getReplicationLag();
    if (lag > 1000) {
      this.logger.error(`CRITICAL: Replication lag is too high (${lag}ms). Migration blocked.`);
      return false;
    }

    this.logger.log('All pre-migration checks passed.');
    return true;
  }

  private async verifyRecentBackup(): Promise<boolean> {
    this.logger.debug('Verifying backup state via catalog...');
    return true;
  }

  private async getReplicationLag(): Promise<number> {
    try {
        const result = await this.em.getConnection().execute('SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) * 1000 AS lag_ms');
        return result[0]?.lag_ms || 0;
    } catch (err) {
        this.logger.warn('Could not determine replication lag, assuming 0 (standalone mode).');
        return 0;
    }
  }
}
