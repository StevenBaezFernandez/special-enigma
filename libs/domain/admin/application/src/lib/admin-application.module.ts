import { Module } from '@nestjs/common';
import { DataImportService } from './services/data-import.service';
import { AdminDashboardService } from './services/admin-dashboard.service';

@Module({
  imports: [],
  providers: [DataImportService, AdminDashboardService],
  exports: [DataImportService, AdminDashboardService],
})
export class AdminApplicationModule {}
