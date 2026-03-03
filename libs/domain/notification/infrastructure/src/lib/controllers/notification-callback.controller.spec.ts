import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCallbackController } from './notification-callback.controller';
import { EntityManager } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';

describe('NotificationCallbackController', () => {
  let controller: NotificationCallbackController;
  let em: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationCallbackController],
      providers: [
        {
          provide: EntityManager,
          useValue: {
            findOne: vi.fn(),
            flush: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationCallbackController>(NotificationCallbackController);
    em = module.get<EntityManager>(EntityManager);
    process.env.TWILIO_AUTH_TOKEN = 'test_token';
  });

  it('should reject invalid twilio signatures', async () => {
    const body = { SmsSid: 'SM123', SmsStatus: 'delivered' };
    const invalidSignature = 'invalid';

    await expect(controller.handleTwilioStatus(body, invalidSignature, 'localhost'))
      .rejects.toThrow(BadRequestException);
  });
});
