import { Controller, Logger, UnauthorizedException } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { metrics } from '@opentelemetry/api';
import {
  parseAndValidateSignedContext,
  runWithTenantContext,
  SignedTenantContextClaims,
  TenantContextValidationError,
} from '@virteex/kernel-auth';
import { EmailService, SmsService, PushNotificationService } from '@virteex/domain-notification-infrastructure';
import { runWithRequiredTenantContext } from '@virteex/kernel-auth';

type TenantPayload = { tenantId: string; region?: string; currency?: string; language?: string };

interface SignedEventPayload<T> {
  context?: string;
  signature?: string;
  payload: T;
}

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);
  private readonly meter = metrics.getMeter('virteex-worker-notification');
  private readonly violationCounter = this.meter.createCounter('tenant_context_violations_total');

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushNotificationService
  ) {}

  @EventPattern('notification.send')
  async handleNotification(@Payload() event: SignedEventPayload<{ to: string; subject: string; body: string }>) {
    return this.handleWithTenantContext(event, 'notification.send', async (data) => {
      this.logger.log(`Received notification request for tenant-aware delivery to ${data.to}`);
      if (data.to && data.subject && data.body) {
        await this.emailService.sendEmail(data.to, data.subject, data.body);
        return;
      }
      throw new UnauthorizedException('Invalid notification payload');
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
  async handleSmsNotification(@Payload() event: SignedEventPayload<{ to: string; body: string }>) {
    return this.handleWithTenantContext(event, 'notification.sms.send', async (data) => {
      this.logger.log(`Received SMS request for ${data.to}`);
      if (data.to && data.body) {
        await this.smsService.sendSms(data.to, data.body);
        return;
      }
      throw new UnauthorizedException('Invalid SMS notification payload');
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
  async handlePushNotification(@Payload() event: SignedEventPayload<{ token: string; title: string; body: string; data?: any }>) {
    return this.handleWithTenantContext(event, 'notification.push.send', async (data) => {
      this.logger.log(`Received push request for token ${data.token}`);
      if (data.token && data.title && data.body) {
        await this.pushService.sendPushNotification(data.token, data.title, data.body, data.data);
        return;
      }
      throw new UnauthorizedException('Invalid Push notification payload');
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
  async handleUserRegistered(@Payload() event: SignedEventPayload<{ email: string; name: string }>) {
    return this.handleWithTenantContext(event, 'user.registered', async (data) => {
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

  private async handleWithTenantContext<T>(
    event: SignedEventPayload<T>,
    eventName: string,
    handler: (payload: T) => Promise<void>
  ): Promise<void> {
    const context = this.extractContext(event, eventName);
    return runWithTenantContext(context, () => handler(event.payload));
  }

  private extractContext(event: SignedEventPayload<unknown>, eventName: string): SignedTenantContextClaims {
    const secret = process.env['VIRTEEX_HMAC_SECRET'] ?? '';
    if (!secret) {
      throw new UnauthorizedException('Worker misconfigured: VIRTEEX_HMAC_SECRET is required.');
    }

    try {
      return parseAndValidateSignedContext(event.context, event.signature, secret);
    } catch (error) {
      if (error instanceof TenantContextValidationError) {
        this.auditInvalidAttempt(eventName, error.violationType, error.message);
      }
      throw new UnauthorizedException('Rejected event without valid signed tenant context.');
    }
  }

  private auditInvalidAttempt(eventName: string, violationType: string, reason: string) {
    const payload = { channel: 'worker-event', eventName, violationType, reason };
    this.logger.warn(JSON.stringify({ event: 'tenant_context_rejected', ...payload }));
    this.violationCounter.add(1, { channel: 'worker-event', eventName, violationType });
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
