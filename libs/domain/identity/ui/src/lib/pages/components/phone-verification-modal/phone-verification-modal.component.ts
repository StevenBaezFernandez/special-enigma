import { Component, Input, Output, EventEmitter, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-phone-verification-modal',
  standalone: true,
  imports: [CommonModule],
  template: ''
})
export class PhoneVerificationModalComponent {
  @Input() isOpen: WritableSignal<boolean> = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();
}
