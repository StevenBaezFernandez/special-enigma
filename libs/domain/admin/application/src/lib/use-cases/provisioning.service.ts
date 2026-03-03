import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/core';
import { TenantOperationService, TenantService, OperationType, OperationState, TenantMode } from '@virteex/kernel-tenant';
import Redis from 'ioredis';

export enum ProvisioningStatus {
  STARTING = 'STARTING',
  DATABASE_CREATION = 'DATABASE_CREATION',
  SCHEMA_MIGRATION = 'SCHEMA_MIGRATION',
  SEEDING = 'SEEDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);
  private statusMap = new Map<string, { status: ProvisioningStatus; progress: number; message: string }>();
  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly orm: MikroORM,
    private readonly tenantService: TenantService,
    private readonly operationService: TenantOperationService
  ) {
    this.redis = new Redis(this.configService.get('REDIS_URL') || 'redis://localhost:6379');
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

    this.statusMap.set(tenantId, { status: ProvisioningStatus.STARTING, progress: 0, message: 'Initializing provisioning saga...' });

    // Non-blocking execution of the Saga
    this.runProvisioningSaga(tenantId, op.operationId, lockKey).catch(err => {
        this.logger.error(`Provisioning Saga failed for tenant ${tenantId}: ${err.message}`);
    });
  }

  private async runProvisioningSaga(tenantId: string, operationId: string, lockKey: string) {
    this.logger.log(`Executing Provisioning Saga for tenant: ${tenantId}`);

    try {
      // 1. PREPARING
      await this.operationService.transitionState(operationId, OperationState.PREPARING);
      this.updateLocalStatus(tenantId, ProvisioningStatus.DATABASE_CREATION, 20, 'Creating isolated data space...');

      const config = await this.tenantService.getTenantConfig(tenantId);
      const generator = this.orm.getSchemaGenerator();

      if (config.mode === TenantMode.SCHEMA) {
        await generator.createSchema({ schema: config.schemaName });
      } else if (config.mode === TenantMode.DATABASE) {
        const tenantEm = this.orm.em.fork({ connectionString: config.connectionString });
        await tenantEm.getSchemaGenerator().createSchema();
      } else {
        await generator.updateSchema(); // SHARED mode
      }

      // 2. VALIDATING
      await this.operationService.transitionState(operationId, OperationState.VALIDATING);
      this.updateLocalStatus(tenantId, ProvisioningStatus.SCHEMA_MIGRATION, 50, 'Validating and applying migrations...');

      const migrator = this.orm.getMigrator();
      await migrator.up();

      // 3. SWITCHED (Seeding)
      await this.operationService.transitionState(operationId, OperationState.SWITCHED);
      this.updateLocalStatus(tenantId, ProvisioningStatus.SEEDING, 80, 'Seeding initial tenant data...');

      await this.seedTenantData(tenantId);

      // 4. MONITORING (Smoke tests)
      await this.operationService.transitionState(operationId, OperationState.MONITORING);
      await this.runSmokeTests(tenantId);

      // 5. FINALIZED
      await this.operationService.transitionState(operationId, OperationState.FINALIZED);
      this.updateLocalStatus(tenantId, ProvisioningStatus.COMPLETED, 100, 'Provisioning successful.');

    } catch (error: any) {
      this.logger.error(`Saga Step Failed for ${tenantId}: ${error.message}`);
      await this.operationService.transitionState(operationId, OperationState.ROLLBACK, { error: error.message });
      this.updateLocalStatus(tenantId, ProvisioningStatus.FAILED, 0, `Provisioning failed: ${error.message}`);
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async seedTenantData(tenantId: string) {
    this.logger.log(`Seeding data for tenant ${tenantId}`);
  }

  private async runSmokeTests(tenantId: string) {
    this.logger.log(`Running smoke tests for tenant ${tenantId}`);
  }

  private updateLocalStatus(tenantId: string, status: ProvisioningStatus, progress: number, message: string) {
    this.statusMap.set(tenantId, { status, progress, message });
  }

  getStatus(tenantId: string) {
    return this.statusMap.get(tenantId) || { status: ProvisioningStatus.FAILED, progress: 0, message: 'Tenant not found.' };
  }
}
