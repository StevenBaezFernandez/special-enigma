import { Module } from '@nestjs/common';
import { AdminPresentationModule } from '@virteex/domain-admin-presentation';

@Module({
  imports: [AdminPresentationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
