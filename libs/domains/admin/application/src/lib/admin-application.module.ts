import { Module } from '@nestjs/common';
import { DataImportService } from './services/data-import.service';

@Module({
  imports: [],
  providers: [DataImportService],
  exports: [DataImportService],
})
export class AdminApplicationModule {}
