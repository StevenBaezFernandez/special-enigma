import { Module } from '@nestjs/common';
import { UpdateConfigUseCase } from './use-cases/update-config.use-case';

@Module({
  providers: [UpdateConfigUseCase],
  exports: [UpdateConfigUseCase]
})
export class AdminApplicationModule {}
