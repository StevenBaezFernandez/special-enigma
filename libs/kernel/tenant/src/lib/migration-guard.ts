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
    this.logger.debug('Verifying backup state via infra catalog...');
    try {
        // Query the backup catalog for the latest successful snapshot in the last 24h
        const result = await this.em.getConnection().execute(`
          SELECT 1 FROM backup_catalog
          WHERE status = 'SUCCESS'
          AND finished_at > now() - interval '24 hours'
          LIMIT 1
        `);
        return result.length > 0;
    } catch (err) {
        this.logger.warn('Backup catalog not available or query failed. Falling back to safety-first (blocked).');
        return false;
    }
  }

  private async getReplicationLag(): Promise<number> {
    const isProduction = process.env['NODE_ENV'] === 'production';
    try {
        // Precise lag calculation from pg_stat_replication for production clusters
        const result = await this.em.getConnection().execute(`
          SELECT
            COALESCE(EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) * 1000, 0) AS lag_ms
        `);

        const lag = parseFloat(result[0]?.lag_ms || '0');

        // If query returns null/zero in production, it might mean we're on a replica or stats are missing
        if (isProduction && lag === 0) {
            this.logger.warn('Replication lag reported as 0 in production. Verifying if standalone or replica.');
            const recovery = await this.em.getConnection().execute('SELECT pg_is_in_recovery()');
            if (recovery[0]?.pg_is_in_recovery) {
                 this.logger.log('Running on replica, lag of 0 is acceptable if synchronous.');
            }
        }

        return lag;
    } catch (err) {
        if (isProduction) {
            this.logger.error('CRITICAL: Could not determine replication lag in production. Failing closed.');
            return 999999; // Force block
        }
        this.logger.warn('Could not determine replication lag. Defaulting to 0 for non-prod.');
        return 0;
    }
  }
}
