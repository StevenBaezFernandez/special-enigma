import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Monitor, Smartphone, Globe, XCircle, Clock } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, ToastService } from '@virteex/shared-ui';

@Component({
  selector: 'virteex-session-management',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './session-management.component.html',
  styleUrl: './session-management.component.scss'
})
export class SessionManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  sessions = signal<any[]>([]);
  isLoading = signal(false);

  readonly icons = { Monitor, Smartphone, Globe, XCircle, Clock };

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.isLoading.set(true);
    this.authService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.showError('SETTINGS.SECURITY.SESSIONS.LOAD_ERROR');
        this.isLoading.set(false);
      }
    });
  }

  revokeSession(sessionId: string) {
    this.authService.revokeSession(sessionId).subscribe({
      next: () => {
        this.toastService.showSuccess('SETTINGS.SECURITY.SESSIONS.REVOKED');
        this.loadSessions();
      },
      error: () => {
        this.toastService.showError('SETTINGS.SECURITY.SESSIONS.REVOKE_ERROR');
      }
    });
  }

  getDeviceIcon(userAgent: string) {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return this.icons.Smartphone;
    }
    return this.icons.Monitor;
  }
}
