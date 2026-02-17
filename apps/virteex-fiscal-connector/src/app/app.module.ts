import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceConsumer } from './invoice.consumer';
import { KafkaModule } from '@virteex/shared/infrastructure/kafka';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'fiscal-connector',
      groupId: 'fiscal-consumer',
    }),
  ],
  controllers: [AppController, InvoiceConsumer],
  providers: [AppService],
})
export class AppModule {}
