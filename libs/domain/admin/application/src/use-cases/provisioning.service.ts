import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantOperationService, TenantService, OperationType, OperationState, TenantMode } from '@virteex/kernel-tenant';
import { type DatabasePort, DATABASE_PORT } from '@virteex/domain-admin-domain';
import { ConflictException } from '@virteex/kernel-exceptions';
import Redis from 'ioredis';

export enum ProvisioningStatus {
  STARTING = 'STARTING',
  DATABASE_CREATION = 'DATABASE_CREATION',
  SCHEMA_MIGRATION = 'SCHEMA_MIGRATION',
  SEEDING = 'SEEDING',
  SMOKE_TESTING = 'SMOKE_TESTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);
  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_PORT) private readonly dbPort: DatabasePort,
    private readonly tenantService: TenantService,
    private readonly operationService: TenantOperationService
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
  }

  async startProvisioning(tenantId: string): Promise<void> {
    const lockKey = `lock:provisioning:${tenantId}`;
    const acquired = await this.redis.set(lockKey, 'LOCKED', 'EX', 300, 'NX');

    if (!acquired) {
      this.logger.warn(`Provisioning already in progress for tenant: ${tenantId}`);
      throw new ConflictException(`A provisioning operation is already in progress for tenant ${tenantId}.`);
    }

    const idempotencyKey = `provision-${tenantId}-${Date.now()}`;
    const op = await this.operationService.createOperation(tenantId, OperationType.PROVISION, idempotencyKey);

    // Non-blocking execution of the Saga
    this.runProvisioningSaga(tenantId, op.operationId, lockKey).catch(err => {
        this.logger.error(`Provisioning Saga failed for tenant ${tenantId}: ${err.message}`);
    });
  }

  private async runProvisioningSaga(tenantId: string, operationId: string, lockKey: string) {
    this.logger.log(`Executing Industrial Provisioning Saga for tenant: ${tenantId}`);

    try {
      // 1. PREPARING (Infrastructure/Data Space)
      await this.operationService.transitionState(operationId, OperationState.PREPARING, { status: ProvisioningStatus.DATABASE_CREATION });

      const config = await this.tenantService.getTenantConfig(tenantId);
      const generator = this.dbPort.getSchemaGenerator();

      if (config.mode === TenantMode.SCHEMA) {
        await (generator as any).createSchema({ schema: config.schemaName });
      } else if (config.mode === TenantMode.DATABASE) {
        const tenantEm = this.dbPort.forkEntityManager();
        await (tenantEm as any).getSchemaGenerator().createSchema();
      } else {
        await generator.updateSchema(); // SHARED mode
      }

      // 2. VALIDATING (Migrations)
      await this.operationService.transitionState(operationId, OperationState.VALIDATING, { status: ProvisioningStatus.SCHEMA_MIGRATION });

      const migrator = this.dbPort.getMigrator();
      if (config.mode === TenantMode.SCHEMA) {
          await migrator.up({ schema: [config.schemaName] } as any);
      } else if (config.mode === TenantMode.DATABASE) {
          const tenantEm = this.dbPort.forkEntityManager();
          await (tenantEm as any).getMigrator().up();
      } else {
          await migrator.up();
      }

      // 3. SWITCHED / SEEDING
      await this.operationService.transitionState(operationId, OperationState.SWITCHING, { status: ProvisioningStatus.SEEDING });
      await this.seedTenantData(tenantId, config);

      // 4. MONITORING / SMOKE TESTS
      await this.operationService.transitionState(operationId, OperationState.MONITORING, { status: ProvisioningStatus.SMOKE_TESTING });
      await this.runSmokeTests(tenantId, config);

      // 5. FINALIZED
      await this.operationService.transitionState(operationId, OperationState.FINALIZED, { status: ProvisioningStatus.COMPLETED });
      await this.tenantService.activateTenant(tenantId);

    } catch (error: any) {
      this.logger.error(`Saga Step Failed for ${tenantId}: ${error.message}`);
      await this.operationService.transitionState(operationId, OperationState.ROLLBACK, { error: error.message, status: ProvisioningStatus.FAILED });
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async seedTenantData(tenantId: string, config: any) {
    this.logger.log(`Executing real data seeding for tenant ${tenantId}`);

    // Industrial seeding of base catalogs, fiscal settings, and admin user
    const em = this.dbPort.forkEntityManager();
    if (config.mode === TenantMode.SCHEMA) {
        (em as any).schema = config.schemaName;
    }

    await em.begin();
    try {
        // Seed base system configuration
        await em.getConnection().execute(`
            INSERT INTO system_settings (tenant_id, key, value)
            VALUES (?, ?, ?)
        `, [tenantId, 'onboarding_version', '5.0']);

        // Seed default tax profiles (Critical for ERP GA)
        await em.getConnection().execute(`
            INSERT INTO tax_profiles (tenant_id, country_code, is_active)
            VALUES (?, ?, ?)
        `, [tenantId, config.settings?.['country'] || 'US', true]);

        await em.commit();
        this.logger.log(`Data seeding COMPLETED for tenant ${tenantId}`);
    } catch (err) {
        await em.rollback();
        throw err;
    }
  }

  private async runSmokeTests(tenantId: string, config: any) {
    this.logger.log(`Executing automated smoke tests for tenant ${tenantId}`);

    // Real health probes
    const em = this.dbPort.forkEntityManager();

    // Probe 1: Data plane reachability
    const dbCheck = await em.getConnection().execute('SELECT 1');
    if (!dbCheck) throw new Error('Data plane unreachable post-provisioning');

    // Probe 2: Tenant isolation verification (Adversarial)
    if (config.mode === TenantMode.SHARED) {
        // Verify RLS session variable works
        await em.getConnection().execute('SET LOCAL app.current_tenant = ?', [tenantId]);
        const rlsCheck = await em.getConnection().execute("SELECT current_setting('app.current_tenant') as cid");
        if (rlsCheck[0].cid !== tenantId) {
            throw new Error('RLS session context isolation FAILURE during smoke test');
        }
    }

    this.logger.log(`Smoke tests PASSED for tenant ${tenantId}`);
  }

  async getStatus(tenantId: string) {
    const op = await this.operationService.createOperation(tenantId, OperationType.PROVISION, `query-${tenantId}`);
    return {
        status: op.result?.status || ProvisioningStatus.STARTING,
        state: op.state,
        operationId: op.operationId
    };
  }
}
