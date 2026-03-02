import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from './outbox.service';
import { EntityManager } from '@mikro-orm/core';

describe('OutboxService', () => {
  let service: OutboxService;
  let em: EntityManager;

  beforeEach(async () => {
    const mockEm = {
      persist: vi.fn(),
      flush: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
    em = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should persist an outbox event', async () => {
    const event = {
      aggregateType: 'Order',
      aggregateId: '123',
      eventType: 'OrderCreated',
      payload: { amount: 100 },
    };

    await service.add(event);

    expect(em.persist).toHaveBeenCalled();
  });
});
