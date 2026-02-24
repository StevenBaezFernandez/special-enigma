import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminApplicationModule } from '@virteex/application-admin-application';
import { AdminInfrastructureModule } from '@virteex/infra-admin-infrastructure';

@Module({
  imports: [AdminApplicationModule, AdminInfrastructureModule],
  controllers: [AdminController, AdminDashboardController],
  providers: [],
})
export class AdminPresentationModule {}
