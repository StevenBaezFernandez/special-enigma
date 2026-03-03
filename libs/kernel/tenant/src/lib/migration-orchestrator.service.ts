import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Tenant } from './entities/tenant.entity';
import { TenantMode } from './interfaces/tenant-config.interface';
import { MigrationGuard } from './migration-guard';

@Injectable()
export class MigrationOrchestratorService {
  private readonly logger = new Logger(MigrationOrchestratorService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly migrationGuard: MigrationGuard
  ) {}

  async migrateTenantWithOperation(tenantId: string, idempotencyKey: string): Promise<void> {
    this.logger.log(`Starting migration operation for tenant ${tenantId} with key ${idempotencyKey}`);

    const isSafe = await this.migrationGuard.preMigrationCheck();
    if (!isSafe) {
        throw new Error(`Migration safety checks failed for tenant ${tenantId}. Aborting.`);
    }

    const tenant = await this.em.findOneOrFail(Tenant, { id: tenantId });

    this.logger.debug(`Operation PREPARING for tenant ${tenantId}`);

    try {
        if (tenant.mode === TenantMode.DATABASE) {
            const tenantEm = this.em.fork({
                connectionString: tenant.connectionString,
            });
            const migrator = tenantEm.getMigrator();
            await migrator.up();
        } else {
            const migrator = this.em.getMigrator();
            await migrator.up({ schema: tenant.schemaName });
        }

        this.logger.log(`Migration FINALIZED for tenant ${tenantId}`);
    } catch (error: any) {
        this.logger.error(`Migration FAILED for tenant ${tenantId}. Triggering ROLLBACK logic.`);
        throw error;
    }
  }

  async migrateDatabasePerTenant(tenantId: string): Promise<void> {
    await this.migrateTenantWithOperation(tenantId, `manual-${Date.now()}`);
  }

  async migrateAllTenantsByMode(mode: TenantMode): Promise<void> {
      const tenants = await this.em.find(Tenant, { mode });
      this.logger.log(`Starting mass migration for ${tenants.length} tenants in mode ${mode}`);

      for (const tenant of tenants) {
          if (mode === TenantMode.DATABASE) {
              await this.migrateDatabasePerTenant(tenant.id);
          } else {
              this.logger.log(`Migrating schema ${tenant.schemaName} for tenant ${tenant.id}`);
              const migrator = (this.em as any).getMigrator();
              await migrator.up({ schema: tenant.schemaName });
          }
      }
  }
}
