import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Shield, ShieldCheck, ShieldAlert, Key, Smartphone, Mail, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, ToastService } from '@virteex/shared-ui';

@Component({
  selector: 'virteex-two-factor-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  mfaEnabled = signal(false);
  mfaSecret = signal<string | null>(null);
  qrCodeUrl = signal<string | null>(null);
  backupCodes = signal<string[]>([]);
  showBackupCodes = signal(false);
  verificationCode = signal('');
  isVerifying = signal(false);
  isLoading = signal(false);

  readonly icons = { Shield, ShieldCheck, ShieldAlert, Key, Smartphone, Mail, Copy, Check, AlertTriangle, RefreshCw };

  ngOnInit() {
    this.checkMfaStatus();
  }

  checkMfaStatus() {
    const user = this.authService.currentUser();
    this.mfaEnabled.set(!!user?.mfaEnabled);
  }

  setupMfa() {
    this.isLoading.set(true);
    this.authService.generateMfaSecret().subscribe({
      next: (res) => {
        this.mfaSecret.set(res.secret);
        this.qrCodeUrl.set(res.qrCodeUrl);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.showError('SETTINGS.SECURITY.MFA.SETUP_ERROR');
        this.isLoading.set(false);
      }
    });
  }

  enableMfa() {
    if (this.verificationCode().length !== 6) return;
    this.isVerifying.set(true);
    this.authService.enableMfa(this.verificationCode()).subscribe({
      next: (res) => {
        this.mfaEnabled.set(true);
        this.backupCodes.set(res.backupCodes);
        this.showBackupCodes.set(true);
        this.isVerifying.set(false);
        this.toastService.showSuccess('SETTINGS.SECURITY.MFA.ENABLED');
        this.authService.checkAuthStatus().subscribe();
      },
      error: () => {
        this.toastService.showError('SETTINGS.SECURITY.MFA.INVALID_CODE');
        this.isVerifying.set(false);
      }
    });
  }

  disableMfa() {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return;
    this.authService.disableMfa().subscribe({
      next: () => {
        this.mfaEnabled.set(false);
        this.mfaSecret.set(null);
        this.qrCodeUrl.set(null);
        this.toastService.showSuccess('SETTINGS.SECURITY.MFA.DISABLED');
        this.authService.checkAuthStatus().subscribe();
      },
      error: () => {
        this.toastService.showError('SETTINGS.SECURITY.MFA.DISABLE_ERROR');
      }
    });
  }

  generateBackupCodes() {
    this.authService.generateBackupCodes().subscribe({
      next: (codes) => {
        this.backupCodes.set(codes);
        this.showBackupCodes.set(true);
      },
      error: () => {
        this.toastService.showError('SETTINGS.SECURITY.MFA.BACKUP_CODES_ERROR');
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    this.toastService.showSuccess('COMMON.COPIED');
  }
}
