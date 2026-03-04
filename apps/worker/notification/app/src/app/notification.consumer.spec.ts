import { NotificationConsumer } from './notification.consumer';
import { EmailService, SmsService, PushNotificationService } from '@virteex/domain-notification-infrastructure';

describe('NotificationConsumer tenant enforcement', () => {
  let consumer: NotificationConsumer;
  const emailService = { sendEmail: jest.fn() } as unknown as EmailService;
  const smsService = { sendSms: jest.fn() } as unknown as SmsService;
  const pushService = { sendPushNotification: jest.fn() } as unknown as PushNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    consumer = new NotificationConsumer(emailService, smsService, pushService);
  });

  it('rejects Kafka payloads without tenantId', async () => {
    await expect(
      consumer.handleNotification({ to: 'user@virteex.com', subject: 'hello', body: 'body' } as any)
    ).rejects.toThrow('Tenant context is required');

    expect((emailService.sendEmail as jest.Mock)).not.toHaveBeenCalled();
  });

  it('processes Kafka payloads scoped to tenantId', async () => {
    await consumer.handleNotification({ tenantId: 'tenant-a', to: 'user@virteex.com', subject: 'hello', body: 'body' });

    expect((emailService.sendEmail as jest.Mock)).toHaveBeenCalledTimes(1);
  });
});
