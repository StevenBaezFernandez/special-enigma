import { Module } from '@nestjs/common';
import { FinOpsService } from './finops.service';
import { USAGE_REPOSITORY } from '@virteex/domain-finops-domain';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FinOpsService,
  ],
  exports: [FinOpsService, USAGE_REPOSITORY],
})
export class FinOpsModule {}
