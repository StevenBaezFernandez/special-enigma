import { APP_CONFIG } from '@virteex/shared-config';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private config = inject(APP_CONFIG) as any;
  readonly VAPID_PUBLIC_KEY = this.config.vapidPublicKey || '';

  private swPush = inject(SwPush);
  private http = inject(HttpClient);

  subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      if (this.config.production) {
          console.warn('Push notifications are not enabled (Service Worker not active).');
      }
      return;
    }
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then((sub: PushSubscription) => this.sendToServer(sub))
    .catch((err: unknown) => console.error('Could not subscribe to notifications', err));
  }

  private sendToServer(params: PushSubscription) {
    this.http.post(`${this.config.apiUrl}/push/subscribe`, params).subscribe();
  }
}