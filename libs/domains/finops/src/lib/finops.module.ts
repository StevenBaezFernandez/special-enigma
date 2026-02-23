import { Module } from '@nestjs/common';
import { FinOpsService } from './finops.service';
import { USAGE_REPOSITORY } from './ports/usage.repository';
import { InMemoryUsageRepository } from './infrastructure/memory-usage.repository';

@Module({
  controllers: [],
  providers: [
    FinOpsService,
    {
      provide: USAGE_REPOSITORY,
      useClass: InMemoryUsageRepository,
    },
  ],
  exports: [FinOpsService],
})
export class FinOpsModule {}
