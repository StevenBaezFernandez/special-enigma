import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly isOnline = signal<boolean>(navigator.onLine);

  onOnline(callback: () => void): void {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      callback();
    });
  }

  onOffline(callback?: () => void): void {
    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      callback?.();
    });
  }
}
