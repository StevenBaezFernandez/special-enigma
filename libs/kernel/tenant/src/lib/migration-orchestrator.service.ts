import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Tenant } from './entities/tenant.entity';
import { TenantMode } from './interfaces/tenant-config.interface';

@Injectable()
export class MigrationOrchestratorService {
  private readonly logger = new Logger(MigrationOrchestratorService.name);

  constructor(private readonly em: EntityManager) {}

  async migrateDatabasePerTenant(tenantId: string): Promise<void> {
    const tenant = await this.em.findOneOrFail(Tenant, { id: tenantId });

    if (tenant.mode !== TenantMode.DATABASE) {
        throw new Error(`Tenant ${tenantId} is not in DATABASE mode`);
    }

    this.logger.log(`Starting migration for physical isolated tenant: ${tenantId}`);

    try {
        const tenantEm = this.em.fork({
            connectionString: tenant.connectionString,
        });

        const migrator = tenantEm.getMigrator();
        await migrator.up();

        this.logger.log(`Migration completed for tenant ${tenantId}`);
    } catch (error: any) {
        this.logger.error(`Migration failed for tenant ${tenantId}: ${error.message}`);
        throw error;
    }
  }

  async migrateAllTenantsByMode(mode: TenantMode): Promise<void> {
      const tenants = await this.em.find(Tenant, { mode });
      this.logger.log(`Starting mass migration for ${tenants.length} tenants in mode ${mode}`);

      for (const tenant of tenants) {
          if (mode === TenantMode.DATABASE) {
              await this.migrateDatabasePerTenant(tenant.id);
          } else {
              this.logger.log(`Migrating schema ${tenant.schemaName} for tenant ${tenant.id}`);
              const migrator = this.em.getMigrator();
              await migrator.up({ schema: tenant.schemaName });
          }
      }
  }
}
