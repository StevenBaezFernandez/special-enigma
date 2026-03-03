import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Notification, NotificationChannel } from '../domain/entities/notification.entity';
import { NotificationOrchestrator } from './notification-orchestrator';

@Injectable()
export class NotificationService {
  constructor(
    private readonly em: EntityManager,
    private readonly orchestrator: NotificationOrchestrator
  ) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = new Notification();
    Object.assign(notification, data);
    this.em.persist(notification);
    await this.em.flush();

    await this.orchestrator.send(notification);

    return notification;
  }
}
