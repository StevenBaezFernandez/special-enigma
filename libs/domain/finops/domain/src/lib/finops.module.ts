import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FinOpsService } from './finops.service';
import { USAGE_REPOSITORY } from './ports/usage.repository';
import { SqliteUsageRepository } from './infrastructure/sqlite-usage.repository';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    FinOpsService,
    {
      provide: USAGE_REPOSITORY,
      useClass: SqliteUsageRepository,
    },
  ],
  exports: [FinOpsService],
})
export class FinOpsModule {}
