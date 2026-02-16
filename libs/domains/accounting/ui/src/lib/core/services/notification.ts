import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  showSuccess(message: string): void {
    // Ideally integrate with a toast library or custom component
    alert(message);
  }

  showError(message: string): void {
    console.error('ERROR:', message);
    alert(message);
  }

  showInfo(message: string): void {
    console.info('INFO:', message);
  }
}
