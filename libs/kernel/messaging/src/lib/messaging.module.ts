import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxEvent } from './entities/outbox-event.entity';
import { InboxMessage } from './entities/inbox-message.entity';
import { OutboxService } from './outbox.service';
import { InboxService } from './inbox.service';
import { OutboxProcessor } from './outbox.processor';
import { SagaOrchestrator } from './saga/saga-orchestrator';
import { RedisCacheModule } from '@virteex/shared-infrastructure-cache';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([OutboxEvent, InboxMessage]),
    ScheduleModule.forRoot(),
    RedisCacheModule.forRootAsync({
      useFactory: () => {
        const url = process.env['REDIS_URL'];
        if (url) {
          return url;
        }
        return {
          host: process.env['REDIS_HOST'] || 'localhost',
          port: parseInt(process.env['REDIS_PORT'] || '6379'),
          password: process.env['REDIS_PASSWORD'],
        };
      },
    }),
  ],
  providers: [
    OutboxService,
    InboxService,
    OutboxProcessor,
    SagaOrchestrator,
  ],
  exports: [OutboxService, InboxService, MikroOrmModule, SagaOrchestrator],
})
export class MessagingModule {}
