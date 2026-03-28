import { Module } from '@nestjs/common';
import { CrmApplicationModule } from '@virteex/domain-crm-application';
import { CrmController } from '../controllers/crm.controller';

@Module({
  imports: [CrmApplicationModule],
  controllers: [CrmController],
})
export class CrmPresentationModule {}
