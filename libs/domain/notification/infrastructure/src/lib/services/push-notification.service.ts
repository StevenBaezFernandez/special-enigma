import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private isInitialized = false;

  onModuleInit() {
    if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      this.isInitialized = true;
      this.logger.log('Firebase Admin initialized for Push Notifications.');
    } else {
        this.logger.warn('Firebase credentials not provided. Push Notifications will be disabled.');
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any): Promise<void> {
    if (!this.isInitialized) {
        this.logger.warn(`Push Notification to ${token} skipped: Firebase not initialized.`);
        return;
    }

    try {
      const response = await admin.messaging().send({
        token,
        notification: { title, body },
        data: data ? this.stringifyData(data) : undefined,
      });
      this.logger.log(`Push Notification successfully sent to ${token}, Response: ${response}`);
    } catch (err: any) {
      this.logger.error(`Error sending Push Notification to ${token}: ${err.message}`);
      throw err;
    }
  }

  private stringifyData(data: any): { [key: string]: string } {
    const stringified: { [key: string]: string } = {};
    for (const key in data) {
      stringified[key] = String(data[key]);
    }
    return stringified;
  }
}
