import { Module } from '@nestjs/common';
import { FiscalDomainService } from './fiscal-domain.service';

@Module({
  providers: [FiscalDomainService],
  exports: [FiscalDomainService],
})
export class FiscalDomainModule {}
