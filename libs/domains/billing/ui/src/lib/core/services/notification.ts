import { Injectable, inject } from '@angular/core';
import { ToastService } from '@virteex/shared-ui';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastService = inject(ToastService);

  showSuccess(message: string): void {
    this.toastService.showSuccess(message);
  }

  error(message: string): void {
    this.toastService.showError(message);
  }

  showError(message: string): void {
    this.toastService.showError(message);
  }

  showInfo(message: string): void {
    console.info('INFO:', message);
    // Optionally add showInfo to ToastService if needed, falling back to success style or implementing info style
    this.toastService.showSuccess(message);
  }
}
