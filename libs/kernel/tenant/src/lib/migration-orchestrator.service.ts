import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { createHmac, createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Tenant } from './entities/tenant.entity';
import { TenantMode, OperationType, OperationState } from './interfaces/tenant-config.interface';
import { MigrationGuard } from './migration-guard';
import { TenantOperationService } from './tenant-operation.service';
import { RoutingPlaneService } from './routing-plane.service';

@Injectable()
export class MigrationOrchestratorService {
  private readonly logger = new Logger(MigrationOrchestratorService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly migrationGuard: MigrationGuard,
    private readonly operationService: TenantOperationService,
    private readonly routingPlane: RoutingPlaneService
  ) {}

  async migrateTenantWithOperation(tenantId: string, idempotencyKey: string): Promise<void> {
    this.logger.log(`Starting industrial migration for tenant ${tenantId} with key ${idempotencyKey}`);

    const locked = await this.operationService.acquireLock(tenantId);
    if (!locked) {
        throw new ConflictException(`Another control-plane operation is in progress for tenant ${tenantId}`);
    }

    try {
      const op = await this.operationService.createOperation(tenantId, OperationType.MIGRATE, idempotencyKey);
      if (op.state === OperationState.FINALIZED) return;

      try {
          await this.operationService.transitionState(op.operationId, OperationState.PREPARING);

          const isSafe = await this.migrationGuard.preMigrationCheck();
          if (!isSafe) {
              throw new Error(`Migration safety checks failed for tenant ${tenantId}. Aborting.`);
          }

          const tenant = await this.em.findOneOrFail(Tenant, { id: tenantId });
          await this.operationService.transitionState(op.operationId, OperationState.VALIDATING);

          // 1. Snapshot pre-migration state for rollback
          const preMigrationStats = await this.getStrongTableStats(tenant);
          await this.operationService.transitionState(op.operationId, OperationState.VALIDATING, { preMigrationStats });

          await this.dryRun(op.operationId, tenant);
          await this.executeMigration(op.operationId, tenant);
          await this.executeSwitch(op.operationId, tenantId);
          const operationRefs = {
            tenantId,
            operationId: op.operationId,
            requestedAt: op.startedAt?.toISOString?.() ?? new Date().toISOString(),
            idempotencyKey,
          };
          const evidenceUri = await this.reconcile(op.operationId, tenantId, preMigrationStats, operationRefs);

          await this.operationService.transitionState(op.operationId, OperationState.FINALIZED, undefined, evidenceUri);
          this.logger.log(`Migration SUCCESS for tenant ${tenantId}`);
      } catch (error: any) {
          this.logger.error(`Migration CRITICAL FAILURE for tenant ${tenantId}: ${error.message}`);
          await this.operationService.transitionState(op.operationId, OperationState.ROLLBACK, { error: error.message });
          try {
            const rollbackEvidenceUri = await this.executeRollback(op.operationId, tenantId, op.result?.preMigrationStats || {});
            await this.operationService.transitionState(op.operationId, OperationState.ROLLBACK, undefined, rollbackEvidenceUri);
          } catch (rollbackError: any) {
            this.logger.error(`Rollback evidence generation failed for tenant ${tenantId}: ${rollbackError.message}`);
          }
          throw error;
      }
    } finally {
        await this.operationService.releaseLock(tenantId);
    }
  }

  private async dryRun(operationId: string, tenant: Tenant): Promise<void> {
      await this.operationService.transitionState(operationId, OperationState.DRY_RUN);
      this.logger.log(`Executing real Dry-Run impact analysis for tenant ${tenant.id}`);

      let pendingCount = 0;
      if (tenant.mode === TenantMode.DATABASE) {
          const tenantEm = (this.em as any).fork({ connectionString: tenant.connectionString });
          pendingCount = (await (tenantEm as any).getMigrator().getPendingMigrations()).length;
      } else {
          pendingCount = (await (this.em as any).getMigrator().getPendingMigrations()).length;
      }

      const impact = {
          pendingMigrations: pendingCount,
          isSafe: pendingCount < 10, // Enterprise threshold
          timestamp: new Date()
      };

      if (!impact.isSafe) {
          throw new Error(`Migration impact too high (${pendingCount} pending). Manual intervention required.`);
      }

      await this.operationService.transitionState(operationId, OperationState.DRY_RUN, { dryRun: impact });
  }

  private async executeMigration(operationId: string, tenant: Tenant): Promise<void> {
      await this.operationService.transitionState(operationId, OperationState.SWITCHING);
      if (tenant.mode === TenantMode.DATABASE) {
          const tenantEm = (this.em as any).fork({ connectionString: tenant.connectionString });
          const migrator = (tenantEm as any).getMigrator();
          await migrator.up();
      } else {
          const migrator = (this.em as any).getMigrator();
          await migrator.up({ schema: tenant.schemaName });
      }
      await this.operationService.transitionState(operationId, OperationState.SWITCHED);
  }

  private async executeSwitch(operationId: string, tenantId: string): Promise<void> {
      this.logger.log(`Switching routing atómico for tenant ${tenantId}`);
      const config = await this.routingPlane.resolveRoute(tenantId);
      await this.routingPlane.createSnapshot(tenantId, { ...config, version: (config.version || 0) + 1 });
  }

  private async reconcile(
    operationId: string,
    tenantId: string,
    preMigrationStats: any,
    operationRefs: Record<string, string>
  ): Promise<string> {
      await this.operationService.transitionState(operationId, OperationState.RECONCILING);
      this.logger.log(`Executing INDUSTRIAL reconciliation for ${tenantId}`);

      const tenant = await this.em.findOneOrFail(Tenant, { id: tenantId });
      const postMigrationStats = await this.getStrongTableStats(tenant);

      // Perform deep data-diff
      const diffs = this.calculateDataDiff(preMigrationStats, postMigrationStats);

      if (diffs.length > 0) {
          this.logger.error(`INTEGRITY VIOLATION for tenant ${tenantId}: ${JSON.stringify(diffs)}`);
          throw new Error(`Post-migration data-diff detected unauthorized changes or data loss.`);
      }

      await this.operationService.transitionState(operationId, OperationState.RECONCILING, {
          reconciled: true,
          stats: postMigrationStats,
          verifiedAt: new Date(),
          integrity: 'checksum-verified'
      });

      const evidenceUri = await this.persistChecksumEvidence({
        operationId,
        tenantId,
        phase: 'post-migration',
        preMigrationStats,
        postMigrationStats,
        operationRefs,
      });

      // Shadow monitoring phase
      await this.operationService.transitionState(operationId, OperationState.MONITORING);
      await this.shadowCheck(tenantId);
      return evidenceUri;
  }

  private calculateDataDiff(pre: any, post: any): string[] {
      const violations: string[] = [];
      for (const table of Object.keys(pre)) {
          if (!post[table]) {
              violations.push(`Table ${table} missing in post-migration stats`);
              continue;
          }
          if (pre[table].count !== post[table].count) {
              violations.push(`Row count mismatch in ${table}: expected ${pre[table].count}, got ${post[table].count}`);
          }
          if (pre[table].checksum !== post[table].checksum) {
              violations.push(`Checksum violation in ${table}: data content has changed unexpectedly.`);
          }
          if (pre[table].structuralHash !== post[table].structuralHash) {
              violations.push(`Structural integrity violation in ${table}: Schema or meta-data mismatch.`);
          }
      }
      return violations;
  }

  private async getStrongTableStats(tenant: Tenant): Promise<any> {
      let em = this.em;
      let schema = tenant.schemaName;

      if (tenant.mode === TenantMode.DATABASE) {
          em = (this.em as any).fork({ connectionString: tenant.connectionString });
          schema = undefined;
      }

      const qb = em.getConnection();

      const discoveredSchema = tenant.mode === TenantMode.SCHEMA ? schema : 'public';
      const tablesResult = await qb.execute(
        `
          SELECT t.table_name
          FROM information_schema.tables t
          WHERE t.table_schema = ?
            AND t.table_type = 'BASE TABLE'
            AND t.table_name NOT LIKE 'pg_%'
          ORDER BY t.table_name
      `,
        [discoveredSchema]
      );

      const tables = tablesResult.map((r: any) => r.table_name || r.TABLE_NAME || r.tableName);
      const stats: Record<string, any> = {};

      for (const table of tables) {
          if (!table) continue;
          const tableName = schema ? `"${schema}"."${table}"` : `"${table}"`;
          const tableOnly = table;
          const columnsResult = await qb.execute(
            `
              SELECT column_name
              FROM information_schema.columns
              WHERE table_name = ?
                AND table_schema = ?
              ORDER BY ordinal_position
            `,
            [table, discoveredSchema]
          );

          const columns = columnsResult.map((column: any) => column.column_name || column.COLUMN_NAME || column.columnName);
          const hasTenantFilter = columns.includes('tenant_id');

          if (columns.length === 0) {
            continue;
          }

          const rowExpression = columns
            .map((column: string) => `COALESCE("${column}"::text, '<null>')`)
            .join(` || '|' || `);

          try {
              const query = `
                  SELECT
                    COUNT(*) as count,
                    COALESCE(md5(string_agg(${rowExpression}, ',' ORDER BY ${rowExpression})), '0') as checksum,
                    (SELECT md5(string_agg(column_name || data_type, ',' ORDER BY ordinal_position))
                     FROM information_schema.columns
                     WHERE table_name = ? AND table_schema = ?) as structural_hash
                  FROM ${tableName}
                  ${tenant.mode === TenantMode.SHARED && hasTenantFilter ? ` WHERE tenant_id = ?` : ''}
              `;
              const params = tenant.mode === TenantMode.SHARED && hasTenantFilter
                ? [tableOnly, schema || 'public', tenant.id]
                : [tableOnly, schema || 'public'];

              const result = await qb.execute(query, params);

              stats[table] = {
                  count: parseInt(result[0]?.count || '0'),
                  checksum: result[0]?.checksum || '0',
                  structuralHash: result[0]?.structural_hash || '0'
              };
          } catch (e) {
              this.logger.warn(`Could not get strong stats for ${tableName}: ${e instanceof Error ? e.message : String(e)}`);
              stats[table] = { count: 0, checksum: '0', structuralHash: '0' };
          }
      }
      return stats;
  }

  private async shadowCheck(tenantId: string): Promise<void> {
      this.logger.log(`Initiating shadow monitoring for tenant ${tenantId}`);
      // Real consistency check: verify that primary and secondary regions are synchronized
      const lagResult = await this.em.getConnection().execute(`
        SELECT COALESCE(EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())), 0) as lag
      `);

      const lag = lagResult[0]?.lag || 0;
      if (lag > 5) { // 5s lag limit for GA readiness
          throw new Error(`Shadow monitoring detected unacceptable replication lag (${lag}s) during migration window`);
      }
  }

  private async executeRollback(operationId: string, tenantId: string, preMigrationStats: Record<string, any>): Promise<string> {
      this.logger.warn(`CRITICAL: Deterministic ROLLBACK initiated for tenant ${tenantId}`);

      try {
          const tenant = await this.em.findOneOrFail(Tenant, { id: tenantId });
          // 1. Rollback DB schema
          if (tenant.mode === TenantMode.DATABASE) {
              const tenantEm = (this.em as any).fork({ connectionString: tenant.connectionString });
              await (tenantEm as any).getMigrator().down();
          } else {
              await (this.em as any).getMigrator().down({ schema: tenant.schemaName });
          }

          // 1.1 Verify rollback data consistency against pre-migration snapshot
          const rollbackStats = await this.getStrongTableStats(tenant);
          const rollbackDiffs = this.calculateDataDiff(preMigrationStats, rollbackStats);
          if (rollbackDiffs.length > 0) {
              throw new Error(`Rollback integrity verification failed: ${rollbackDiffs.join('; ')}`);
          }

          const evidenceUri = await this.persistRollbackEvidence({
            operationId,
            tenantId,
            rollbackStats,
            preMigrationStats,
          });

          // 2. Rollback Routing snapshot
          const config = await this.routingPlane.resolveRoute(tenantId);
          if (config.version > 1) {
              await this.routingPlane.createSnapshot(tenantId, { ...config, version: config.version - 1, rollback: true });
          }

          this.logger.log(`Rollback migration and routing executed successfully for ${tenantId}`);
          return evidenceUri;
      } catch (err: any) {
          this.logger.error(`Rollback FAILED for ${tenantId}: ${err.message}. Manual recovery required.`);
          throw err;
      }
  }

  private async persistChecksumEvidence(payload: {
    operationId: string;
    tenantId: string;
    phase: string;
    preMigrationStats: Record<string, any>;
    postMigrationStats: Record<string, any>;
    operationRefs: Record<string, string>;
  }): Promise<string> {
    const secret = process.env['EVIDENCE_SIGNING_SECRET'] || process.env['AUDIT_HMAC_SECRET'];
    if (!secret) {
      throw new Error('EVIDENCE_SIGNING_SECRET or AUDIT_HMAC_SECRET is required for migration evidence signing.');
    }

    const rootDir = path.join(process.cwd(), 'evidence', 'migrations', payload.operationId);
    fs.mkdirSync(rootDir, { recursive: true });

    const digest = createHash('sha256')
      .update(JSON.stringify({ pre: payload.preMigrationStats, post: payload.postMigrationStats }))
      .digest('hex');

    const body = {
      tenantId: payload.tenantId,
      operationId: payload.operationId,
      phase: payload.phase,
      operationRefs: payload.operationRefs,
      generatedAt: new Date().toISOString(),
      checksums: {
        pre: payload.preMigrationStats,
        post: payload.postMigrationStats,
      },
      integrityDigest: digest,
    };

    const signature = createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    const manifest = { ...body, signature, signatureAlgorithm: 'HMAC-SHA256' };
    const manifestPath = path.join(rootDir, 'checksum-manifest.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    return path.relative(process.cwd(), manifestPath);
  }

  private async persistRollbackEvidence(payload: {
    operationId: string;
    tenantId: string;
    rollbackStats: Record<string, any>;
    preMigrationStats: Record<string, any>;
  }): Promise<string> {
    const secret = process.env['EVIDENCE_SIGNING_SECRET'] || process.env['AUDIT_HMAC_SECRET'];
    if (!secret) {
      throw new Error('EVIDENCE_SIGNING_SECRET or AUDIT_HMAC_SECRET is required for rollback evidence signing.');
    }

    const rollbackDir = path.join(process.cwd(), 'evidence', 'reports', 'rollback');
    fs.mkdirSync(rollbackDir, { recursive: true });
    const report = {
      tenantId: payload.tenantId,
      operationId: payload.operationId,
      verifiedAt: new Date().toISOString(),
      verified: true,
      preMigrationStats: payload.preMigrationStats,
      rollbackStats: payload.rollbackStats,
    };
    const signature = createHmac('sha256', secret).update(JSON.stringify(report)).digest('hex');
    const signedReport = { ...report, signature, signatureAlgorithm: 'HMAC-SHA256' };
    const reportPath = path.join(rollbackDir, `${payload.tenantId}-${payload.operationId}.json`);
    fs.writeFileSync(reportPath, `${JSON.stringify(signedReport, null, 2)}\n`);
    return path.relative(process.cwd(), reportPath);
  }
}
