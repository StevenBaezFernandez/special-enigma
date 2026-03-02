import { Module } from '@nestjs/common';
import { CrmApplicationModule } from '@virteex/domain-crm-application';
import { CrmInfrastructureModule } from '@virteex/domain-crm-infrastructure';
import { CrmController } from './controllers/crm.controller';

@Module({
  imports: [CrmApplicationModule, CrmInfrastructureModule],
  controllers: [CrmController],
})
export class CrmPresentationModule {}
