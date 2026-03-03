import { Module } from '@nestjs/common';
import { DataImportService } from './services/data-import.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { TenantSupportService } from './services/tenant-support.service';
import { ProvisioningService } from './use-cases/provisioning.service';

@Module({
  imports: [],
  providers: [
    DataImportService,
    AdminDashboardService,
    TenantSupportService,
    ProvisioningService
  ],
  exports: [
    DataImportService,
    AdminDashboardService,
    TenantSupportService,
    ProvisioningService
  ],
})
export class AdminApplicationModule {}
