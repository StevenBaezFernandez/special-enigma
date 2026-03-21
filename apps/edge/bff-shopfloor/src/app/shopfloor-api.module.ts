import { Module } from '@nestjs/common';
import { ShopfloorJobController } from './shopfloor-job.controller';

@Module({
  controllers: [ShopfloorJobController],
})
export class ShopfloorApiModule {}
