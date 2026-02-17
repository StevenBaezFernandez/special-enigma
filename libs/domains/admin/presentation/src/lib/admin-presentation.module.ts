import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminApplicationModule } from '@virteex/admin-application';
import { AdminInfrastructureModule } from '@virteex/admin-infrastructure';

@Module({
  imports: [AdminApplicationModule, AdminInfrastructureModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminPresentationModule {}
