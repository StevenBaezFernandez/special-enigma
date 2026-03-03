import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Index, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum NotificationStatus {
  ACCEPTED = 'accepted',
  RENDERED = 'rendered',
  QUEUED_PROVIDER = 'queued_provider',
  SENT_PROVIDER = 'sent_provider',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  FAILED_TERMINAL = 'failed_terminal',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
}

@Entity({ tableName: 'notifications' })
@Index({ properties: ['tenantId', 'status'] })
@Index({ properties: ['tenantId', 'idempotencyKey'], unique: true })
export class Notification {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property({ nullable: true })
  userId?: string;

  @Enum(() => NotificationChannel)
  channel!: NotificationChannel;

  @Enum(() => NotificationStatus)
  status: NotificationStatus = NotificationStatus.ACCEPTED;

  @Property({ nullable: true })
  templateId?: string;

  @Property({ nullable: true })
  templateVersion?: string;

  @Property({ type: 'json' })
  payload!: Record<string, any>;

  @Property({ nullable: true })
  recipient!: string;

  @Property({ nullable: true })
  idempotencyKey?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  sentAt?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Property({ nullable: true })
  providerMessageId?: string;

  @Property({ nullable: true })
  providerName?: string;

  @OneToMany(() => NotificationAttempt, (attempt) => attempt.notification)
  history = new Collection<NotificationAttempt>(this);
}

@Entity({ tableName: 'notification_attempts' })
export class NotificationAttempt {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Notification)
  notification!: Notification;

  @Enum(() => NotificationStatus)
  status!: NotificationStatus;

  @Property({ nullable: true, type: 'text' })
  reason?: string;

  @Property()
  occurredAt: Date = new Date();

  @Property({ nullable: true, type: 'json' })
  providerResponse?: Record<string, any>;
}
