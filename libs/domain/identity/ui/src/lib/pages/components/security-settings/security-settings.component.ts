import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Shield, ShieldCheck, ShieldAlert, Key, Smartphone, Mail, Globe, Monitor, Clock, XCircle } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SessionManagementComponent } from '../../profile/components/session-management/session-management.component';
import { TwoFactorAuthComponent } from '../../profile/components/two-factor-auth/two-factor-auth.component';

@Component({
  selector: 'virteex-security-settings',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    TranslateModule,
    SessionManagementComponent,
    TwoFactorAuthComponent
  ],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent {
  readonly icons = { Shield, ShieldCheck, ShieldAlert, Key, Smartphone, Mail, Globe, Monitor, Clock, XCircle };
}
