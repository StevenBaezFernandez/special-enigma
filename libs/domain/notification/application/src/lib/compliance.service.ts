import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConsentLedger, NotificationPreference } from '../domain/entities/compliance.entity';
import { NotificationChannel } from '../domain/entities/notification.entity';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly em: EntityManager) {}

  async canSend(tenantId: string, userId: string, channel: NotificationChannel, category: string): Promise<boolean> {
    // 1. Check Consent Ledger (Opt-in/out)
    const consent = await this.em.findOne(ConsentLedger, {
      tenantId,
      userId,
      channel,
      category
    }, { orderBy: { occurredAt: 'DESC' } });

    if (consent && !consent.isOptedIn) {
      this.logger.warn(`User ${userId} opted out of ${channel} for category ${category}`);
      return false;
    }

    // 2. Check Quiet Hours
    const prefs = await this.em.findOne(NotificationPreference, { tenantId, userId });
    if (prefs?.quietHours?.enabled) {
      if (this.isInQuietHours(prefs.quietHours)) {
        this.logger.warn(`User ${userId} is currently in quiet hours`);
        return false;
      }
    }

    return true;
  }

  private isInQuietHours(quietHours: any): boolean {
    const now = new Date();
    // Convert current time to user timezone and check if it's between start and end
    // Simplified for now: assume HH:mm comparison in UTC for the PoC
    const currentTime = now.toISOString().substring(11, 16);
    return currentTime >= quietHours.start && currentTime <= quietHours.end;
  }
}
