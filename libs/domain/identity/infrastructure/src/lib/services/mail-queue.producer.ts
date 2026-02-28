import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailQueueProducer {
  private readonly logger = new Logger(MailQueueProducer.name);
  private readonly queue: Queue;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    this.queue = new Queue('mail-queue', {
      connection: {
        host: redisHost,
        port: redisPort,
      },
    });
  }

  async addEmailJob(data: { to: string; subject: string; text: string; html: string }) {
    try {
      await this.queue.add('send-email', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
      this.logger.log(`Added email job for ${data.to} to queue`);
    } catch (error) {
      this.logger.error('Failed to add email job to queue', error);
      // In a robust system, we might want to fallback to direct sending or store in DB
      throw error;
    }
  }
}
