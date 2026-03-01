import { Module } from '@nestjs/common';
import { TenantsController } from '@virteex/domain-admin-presentation';

@Module({
  imports: [],
  controllers: [TenantsController],
  providers: [],
})
export class AppModule {}
