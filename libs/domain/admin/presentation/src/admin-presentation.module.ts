import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { TenantsController } from './controllers/tenants.controller';
import { MonitoringController } from './controllers/monitoring.controller';
import { SecurityController } from './controllers/security.controller';
import { IncidentsController } from './controllers/incidents.controller';
import { OperationsController } from './controllers/operations.controller';
import { AdminApplicationModule } from '@virteex/domain-admin-application';
import { AdminInfrastructureModule } from '@virteex/domain-admin-infrastructure';

@Module({
  imports: [AdminApplicationModule, AdminInfrastructureModule],
  controllers: [AdminController, AdminDashboardController, TenantsController, MonitoringController, SecurityController, IncidentsController, OperationsController],
  providers: [],
})
export class AdminPresentationModule {}
