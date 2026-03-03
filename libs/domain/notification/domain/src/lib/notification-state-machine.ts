import { Notification, NotificationStatus, NotificationAttempt } from './entities/notification.entity';

export class NotificationStateMachine {
  private static readonly transitions: Record<NotificationStatus, NotificationStatus[]> = {
    [NotificationStatus.ACCEPTED]: [NotificationStatus.RENDERED, NotificationStatus.FAILED_TERMINAL],
    [NotificationStatus.RENDERED]: [NotificationStatus.QUEUED_PROVIDER, NotificationStatus.FAILED_TERMINAL],
    [NotificationStatus.QUEUED_PROVIDER]: [NotificationStatus.SENT_PROVIDER, NotificationStatus.FAILED_TERMINAL, NotificationStatus.BOUNCED],
    [NotificationStatus.SENT_PROVIDER]: [NotificationStatus.DELIVERED, NotificationStatus.BOUNCED, NotificationStatus.COMPLAINED, NotificationStatus.FAILED_TERMINAL],
    [NotificationStatus.DELIVERED]: [NotificationStatus.OPENED, NotificationStatus.COMPLAINED],
    [NotificationStatus.OPENED]: [],
    [NotificationStatus.BOUNCED]: [],
    [NotificationStatus.COMPLAINED]: [],
    [NotificationStatus.FAILED_TERMINAL]: [],
  };

  static canTransition(from: NotificationStatus, to: NotificationStatus): boolean {
    return this.transitions[from]?.includes(to) ?? false;
  }

  static transition(notification: Notification, to: NotificationStatus, reason?: string, providerResponse?: Record<string, any>): NotificationAttempt {
    if (!this.canTransition(notification.status, to)) {
      throw new Error(`Invalid notification transition from ${notification.status} to ${to}`);
    }

    notification.status = to;
    if (to === NotificationStatus.SENT_PROVIDER) {
      notification.sentAt = new Date();
    } else if (to === NotificationStatus.DELIVERED) {
      notification.deliveredAt = new Date();
    }

    const attempt = new NotificationAttempt();
    attempt.notification = notification;
    attempt.status = to;
    attempt.reason = reason;
    attempt.providerResponse = providerResponse;
    attempt.occurredAt = new Date();

    notification.history.add(attempt);
    return attempt;
  }
}
