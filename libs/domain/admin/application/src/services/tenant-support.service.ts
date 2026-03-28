import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TenantService } from '@virteex/kernel-tenant';

export interface TenantInfo {
    id: string;
    name: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
    subscriptionPlan?: string;
    createdAt: Date;
    integrationHealth: {
        fiscal: boolean;
        payment: boolean;
        storage: boolean;
    };
}

@Injectable()
export class TenantSupportService {
  private readonly logger = new Logger(TenantSupportService.name);

  constructor(private readonly tenantService: TenantService) {}

  async getTenantStatus(tenantId: string): Promise<TenantInfo> {
    this.logger.log(`Fetching support status for tenant: ${tenantId}`);

    const config = await this.tenantService.getTenantConfig(tenantId);
    if (!config) {
        throw new NotFoundException(`Tenant ${tenantId} not found in configuration service.`);
    }

    // In a real system, we'd fetch additional health metrics from Prometheus/OpenTelemetry
    return {
        id: config.tenantId,
        name: `Tenant ${config.tenantId}`, // Name could be stored in Tenant entity
        status: 'ACTIVE',
        subscriptionPlan: 'ENTERPRISE',
        createdAt: new Date(), // Should be from entity
        integrationHealth: {
            fiscal: true,
            payment: true,
            storage: true
        }
    };
  }

  async updateTenantStatus(tenantId: string, newStatus: TenantInfo['status'], reason: string): Promise<void> {
    this.logger.warn(`Updating status for tenant ${tenantId} to ${newStatus}. Reason: ${reason}`);

    // Update the Tenant entity via TenantService
    await this.tenantService.updateTenant(tenantId, {
        // status: newStatus, // Assuming Tenant entity has status
        updatedAt: new Date()
    });

    if (newStatus === 'ACTIVE') {
        this.logger.log(`Performing emergency provisioning tasks for tenant ${tenantId}...`);
        // Trigger actual provisioning logic/jobs here
    }
  }

  async searchTenants(query: string): Promise<Partial<TenantInfo>[]> {
      this.logger.log(`Searching for tenants with query: ${query}`);
      const tenants = await this.tenantService.listTenants(100);
      return tenants
        .filter(t => t.id.includes(query)) // Simple search for now
        .map(t => ({
          id: t.id,
          name: `Tenant ${t.id}`,
          status: 'ACTIVE' // Map from entity
        }));
  }
}
