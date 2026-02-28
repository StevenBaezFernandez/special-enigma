import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiscalService } from '../../services/fiscal.service';

@Component({
  selector: 'virteex-fiscal-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  private fiscalService = inject(FiscalService);
  items = toSignal(this.fiscalService.getTaxRules(), { initialValue: [] });
}
