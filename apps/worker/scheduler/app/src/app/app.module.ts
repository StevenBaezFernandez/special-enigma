import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerInfrastructureModule } from '@virteex/domain-scheduler-infrastructure';
import { SchedulerApplicationModule } from '@virteex/domain-scheduler-application';

@Module({
  imports: [SchedulerInfrastructureModule, SchedulerApplicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
