import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailProcessor implements OnModuleInit {
  private readonly logger = new Logger(MailProcessor.name);
  private worker!: Worker;
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');
    const secure = this.configService.get<boolean>('SMTP_SECURE') ?? false;

    if (!host || !port || !user || !pass) {
        this.logger.error('SMTP configuration missing. MailProcessor will not start correctly.');
        // We initialize transporter to null or throw, but better to just log error to not crash app startup if optional
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    this.worker = new Worker('mail-queue', async (job: Job) => {
      this.logger.log(`Processing email job ${job.id} for ${job.data.to}`);
      try {
          await this.sendEmail(job.data);
      } catch (error) {
          this.logger.error(`Failed to send email to ${job.data.to}: ${error}`);
          throw error; // Re-throw to trigger BullMQ retry
      }
    }, {
      connection: {
        host: redisHost,
        port: redisPort,
      },
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000
      }
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Email job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Email job ${job?.id} failed`, err);
    });
  }

  private async sendEmail(data: { to: string; subject: string; text: string; html: string; from?: string }) {
    const from = data.from || this.configService.get<string>('SMTP_FROM') || '"Virteex ERP" <no-reply@virteex.com>';

    await this.transporter.sendMail({
      from,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });
  }
}
