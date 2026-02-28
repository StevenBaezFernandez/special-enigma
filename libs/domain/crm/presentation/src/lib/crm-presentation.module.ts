import { Module } from '@nestjs/common';
import { CrmApplicationModule } from '../../../application/src';
import { CrmInfrastructureModule } from '../../../infrastructure/src';
import { CrmController } from './controllers/crm.controller';

@Module({
  imports: [CrmApplicationModule, CrmInfrastructureModule],
  controllers: [CrmController],
})
export class CrmPresentationModule {}
