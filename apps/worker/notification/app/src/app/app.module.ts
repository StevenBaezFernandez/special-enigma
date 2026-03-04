import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationConsumer } from './notification.consumer';
import { NotificationInfrastructureModule } from '@virteex/domain-notification-infrastructure';
import { KafkaModule } from '@virteex/platform-kafka';
import { TenantModule } from '@virteex/kernel-tenant';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';

@Module({
  imports: [
    TenantModule,
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
    NotificationInfrastructureModule,
  ],
  controllers: [AppController, NotificationConsumer],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CanonicalTenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
