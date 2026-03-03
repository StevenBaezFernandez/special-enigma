import { Entity, PrimaryKey, Property, Enum, Index } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum ConsentSource {
  ONBOARDING = 'onboarding',
  PROFILE_UPDATE = 'profile_update',
  EXTERNAL_SYNC = 'external_sync',
}

@Entity({ tableName: 'consent_ledger' })
@Index({ properties: ['tenantId', 'userId', 'channel'] })
export class ConsentLedger {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  userId!: string;

  @Property()
  channel!: string;

  @Property()
  category!: string;

  @Property()
  isOptedIn: boolean = true;

  @Enum(() => ConsentSource)
  source!: ConsentSource;

  @Property()
  occurredAt: Date = new Date();

  @Property({ nullable: true })
  termsVersion?: string;

  @Property({ nullable: true })
  metadata?: Record<string, any>;
}

@Entity({ tableName: 'user_notification_preferences' })
@Index({ properties: ['tenantId', 'userId'] })
export class NotificationPreference {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  userId!: string;

  @Property({ type: 'json' })
  preferences!: Record<string, any>;

  @Property({ type: 'json', nullable: true })
  quietHours?: {
    enabled: boolean;
    timezone: string;
    start: string; // HH:mm
    end: string;   // HH:mm
  };

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
