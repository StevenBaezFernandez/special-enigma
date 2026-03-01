import { Module } from '@nestjs/common';
import { DataImportService } from './services/data-import.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { TenantSupportService } from './services/tenant-support.service';

@Module({
  imports: [],
  providers: [DataImportService, AdminDashboardService, TenantSupportService],
  exports: [DataImportService, AdminDashboardService, TenantSupportService],
})
export class AdminApplicationModule {}
