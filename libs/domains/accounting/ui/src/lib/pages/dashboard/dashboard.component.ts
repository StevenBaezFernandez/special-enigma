import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountingService } from '../../services/accounting.service';

@Component({
  selector: 'virteex-accounting-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, DatePipe, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private accountingService = inject(AccountingService);
  accounts$ = this.accountingService.getAccounts();
  journalEntries$ = this.accountingService.getJournalEntries();
}
