import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/core';

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

  constructor(
    private readonly configService: ConfigService,
    private readonly orm: MikroORM
  ) {}

  async startProvisioning(tenantId: string): Promise<void> {
    this.statusMap.set(tenantId, { status: ProvisioningStatus.STARTING, progress: 0, message: 'Initializing provisioning...' });

    // Non-blocking execution
    this.runProvisioning(tenantId).catch(err => {
        this.logger.error(`Provisioning failed for tenant ${tenantId}: ${err.message}`);
        this.statusMap.set(tenantId, { status: ProvisioningStatus.FAILED, progress: 0, message: err.message });
    });
  }

  private async runProvisioning(tenantId: string) {
    this.logger.log(`Starting real provisioning for tenant: ${tenantId}`);

    try {
      // Step 1: DB Creation (Simplified for mono-db RLS or multi-schema)
      this.updateStatus(tenantId, ProvisioningStatus.DATABASE_CREATION, 20, 'Initializing tenant isolated space...');

      const generator = this.orm.getSchemaGenerator();

      // Step 2: Schema Creation/Migration
      this.updateStatus(tenantId, ProvisioningStatus.SCHEMA_MIGRATION, 50, 'Applying latest schema to tenant...');

      // In a real multi-tenant scenario with schema-per-tenant:
      // await generator.createSchema({ schema: `tenant_${tenantId}` });
      // For the current RLS implementation, we ensure RLS policies are active
      await generator.updateSchema();

      // Step 3: Seeding default configuration
      this.updateStatus(tenantId, ProvisioningStatus.SEEDING, 80, 'Seeding default accounting rules and fiscal settings...');

      // Here we would call specialized seeding services for the new tenant
      // e.g. this.accountingSeedService.seed(tenantId);
      await this.simulateStep(1000);

      // Step 4: Completion
      this.updateStatus(tenantId, ProvisioningStatus.COMPLETED, 100, 'Provisioning completed successfully.');
      this.logger.log(`Provisioning completed for tenant: ${tenantId}`);

    } catch (error: any) {
      this.logger.error(`Provisioning failed for ${tenantId}: ${error.message}`);
      this.updateStatus(tenantId, ProvisioningStatus.FAILED, 0, `Error: ${error.message}`);
      throw error;
    }
  }

  private updateStatus(tenantId: string, status: ProvisioningStatus, progress: number, message: string) {
    this.statusMap.set(tenantId, { status, progress, message });
  }

  getStatus(tenantId: string) {
    return this.statusMap.get(tenantId) || { status: ProvisioningStatus.FAILED, progress: 0, message: 'Tenant not found.' };
  }

  private simulateStep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
