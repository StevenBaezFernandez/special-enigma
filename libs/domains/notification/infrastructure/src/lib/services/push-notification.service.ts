import { Injectable, Logger, Optional } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SecretManagerService } from '@virteex/kernel-auth';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private initialized = false;

  constructor(@Optional() private readonly secretManager?: SecretManagerService) {
    const serviceAccountPath = this.secretManager?.getSecret('FIREBASE_SERVICE_ACCOUNT_PATH', '') || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.initialized = true;
        this.logger.log('Firebase Admin initialized successfully.');
      } catch (error: any) {
        this.logger.warn(`Failed to initialize Firebase Admin: ${error.message}`);
      }
    } else {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set. Push Notification service will run in simulation mode.');
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any): Promise<void> {
    if (this.initialized) {
      try {
        await admin.messaging().send({
          token,
          notification: {
            title,
            body,
          },
          data,
        });
        this.logger.log(`Push notification sent to ${token}`);
      } catch (error: any) {
        this.logger.error(`Failed to send push notification: ${error.message}`);
      }
    } else {
      this.logger.log(`[SIMULATION] Push to ${token} - Title: ${title}, Body: ${body}`);
    }
  }
}
