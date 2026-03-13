export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export class Notification {
  id!: string;
  status!: NotificationStatus;
}

export class NotificationStateMachine {
  static canTransition(from: NotificationStatus, to: NotificationStatus): boolean {
    return true;
  }
}
