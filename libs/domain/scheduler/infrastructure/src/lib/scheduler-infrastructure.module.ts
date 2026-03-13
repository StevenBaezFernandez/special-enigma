import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Job } from '@virteex/domain-scheduler-domain';

@Module({
  imports: [MikroOrmModule.forFeature([Job])],
  exports: [MikroOrmModule],
})
export class SchedulerInfrastructureModule {}
