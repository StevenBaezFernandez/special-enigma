import { Module } from '@nestjs/common';
import { CrmApplicationModule } from '@virteex/application-crm-application';
import { CrmInfrastructureModule } from '@virteex/infra-crm-infrastructure';
import { CrmController } from './controllers/crm.controller';

@Module({
  imports: [CrmApplicationModule, CrmInfrastructureModule],
  controllers: [CrmController],
})
export class CrmPresentationModule {}
