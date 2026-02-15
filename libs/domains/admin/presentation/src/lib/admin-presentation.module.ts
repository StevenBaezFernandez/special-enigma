import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminApplicationModule } from '@virteex/admin-application';

@Module({
  imports: [AdminApplicationModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminPresentationModule {}
