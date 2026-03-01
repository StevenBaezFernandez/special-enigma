import { Module } from '@nestjs/common';
import { SqliteUsageRepository } from './persistence/sqlite-usage.repository';
import { USAGE_REPOSITORY } from '@virteex/domain-finops-domain';

@Module({
  providers: [
    {
      provide: USAGE_REPOSITORY,
      useClass: SqliteUsageRepository,
    },
  ],
  exports: [USAGE_REPOSITORY],
})
export class FinOpsInfrastructureModule {}
