import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from '../../../../libs/domains/notification/infrastructure/src/lib/services/email.service';
import { KafkaModule } from '@virteex/shared/infrastructure/kafka';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'notification-service',
      groupId: 'notification-consumer',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
  ],
  controllers: [AppController, NotificationConsumer],
  providers: [AppService, EmailService],
})
export class AppModule {}
