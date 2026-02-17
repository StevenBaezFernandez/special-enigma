import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceConsumer } from './invoice.consumer';
import { KafkaModule } from '@virteex/shared/infrastructure/kafka';

@Module({
  imports: [KafkaModule],
  controllers: [AppController, InvoiceConsumer],
  providers: [AppService],
})
export class AppModule {}
