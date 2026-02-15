import { Module } from '@nestjs/common';
import { SalesPort } from '@virteex/bi-domain';
import { CrmSalesAdapter } from './adapters/crm-sales.adapter';
import { CrmInfrastructureModule } from '@virteex/crm-infrastructure';

@Module({
  imports: [CrmInfrastructureModule],
  providers: [
    {
      provide: SalesPort,
      useClass: CrmSalesAdapter
    }
  ],
  exports: [SalesPort]
})
export class BiInfrastructureModule {}
