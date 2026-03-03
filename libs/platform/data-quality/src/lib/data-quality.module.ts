import { Module } from '@nestjs/common';
import { DataQualityService } from './lib/data-quality.service';

@Module({
  providers: [DataQualityService],
  exports: [DataQualityService],
})
export class DataQualityModule {}
