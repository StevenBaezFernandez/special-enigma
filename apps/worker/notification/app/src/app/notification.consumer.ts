import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService, SmsService, PushNotificationService } from '@virteex/domain-notification-infrastructure';
import { runWithRequiredTenantContext } from '@virteex/kernel-auth';

type TenantPayload = { tenantId: string; region?: string; currency?: string; language?: string };

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushNotificationService
  ) {}

  @EventPattern('notification.send')
  async handleNotification(@Payload() data: TenantPayload & { to: string; subject: string; body: string }) {
    await this.enforceTenantPayload(data, async () => {
      this.logger.log(`Received notification request for tenant ${data.tenantId}`);
      if (data.to && data.subject && data.body) {
        await this.emailService.sendEmail(data.to, data.subject, data.body);
      } else {
        this.logger.warn('Invalid notification payload');
      }
    });
  }

  @EventPattern('notification.sms.send')
  async handleSmsNotification(@Payload() data: TenantPayload & { to: string; body: string }) {
    await this.enforceTenantPayload(data, async () => {
      this.logger.log(`Received SMS notification request for tenant ${data.tenantId}`);
      if (data.to && data.body) {
        await this.smsService.sendSms(data.to, data.body);
      } else {
        this.logger.warn('Invalid SMS notification payload');
      }
    });
  }

  @EventPattern('notification.push.send')
  async handlePushNotification(@Payload() data: TenantPayload & { token: string; title: string; body: string; data?: any }) {
    await this.enforceTenantPayload(data, async () => {
      this.logger.log(`Received Push notification request for tenant ${data.tenantId}`);
      if (data.token && data.title && data.body) {
        await this.pushService.sendPushNotification(data.token, data.title, data.body, data.data);
      } else {
        this.logger.warn('Invalid Push notification payload');
      }
    });
  }

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: TenantPayload & { email: string; name: string }) {
      await this.enforceTenantPayload(data, async () => {
      this.logger.log(`User registered: ${data.email}`);
      await this.emailService.sendEmail(
          data.email,
          'Welcome to Virteex ERP',
          `Hello ${data.name}, welcome to Virteex ERP! Your account has been created.`
      );
      });
  }

  private async enforceTenantPayload(data: TenantPayload, callback: () => Promise<void>) {
    if (!data?.tenantId) {
      throw new Error('Tenant context is required for notification consumers.');
    }

    await runWithRequiredTenantContext({
      tenantId: data.tenantId,
      userId: 'notification-consumer',
      role: ['worker'],
      permissions: ['notification:send'],
      region: data.region || process.env['AWS_REGION'] || 'us-east-1',
      currency: data.currency || 'USD',
      language: data.language || 'en',
    }, callback);
  }
}
