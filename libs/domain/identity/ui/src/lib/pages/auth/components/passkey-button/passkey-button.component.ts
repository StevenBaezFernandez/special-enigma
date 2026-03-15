import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthButtonComponent } from '../auth-button/auth-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'virteex-passkey-button',
  standalone: true,
  imports: [CommonModule, AuthButtonComponent, TranslateModule],
  template: `
    <virteex-auth-button
        variant="secondary"
        (onClick)="onClick.emit()"
        [loading]="loading"
        class="w-full passkey-btn-wrapper">
      <div class="passkey-content">
        <img src="assets/icons/passkey.svg" alt="Passkey" class="passkey-icon">
        <span class="passkey-text"><ng-content></ng-content></span>
      </div>
    </virteex-auth-button>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .passkey-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .passkey-icon {
      width: 20px;
      height: 20px;
      margin-right: 0.75rem;
    }
    .passkey-text {
      font-size: 0.95rem;
      font-weight: 500;
    }
    ::ng-deep .passkey-btn-wrapper .auth-button.secondary {
        background-color: var(--bg-card, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        color: var(--text-primary, #1e293b);
        height: 3rem;

        &:hover {
            background-color: var(--bg-secondary, #f8fafc);
            border-color: var(--text-secondary, #64748b);
        }
    }
  `]
})
export class PasskeyButtonComponent {
    @Input() loading = false;
    @Output() onClick = new EventEmitter<void>();
}
