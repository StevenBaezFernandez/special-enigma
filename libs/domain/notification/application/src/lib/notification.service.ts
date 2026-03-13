import { Injectable } from '@nestjs/common';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

@Injectable()
export class NotificationService {
  async createNotification(data: any): Promise<void> {
    // Stub implementation
    console.log('Creating notification', data);
  }
}
