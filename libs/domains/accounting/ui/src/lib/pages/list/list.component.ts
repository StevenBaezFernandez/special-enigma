import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountingService } from '../../services/accounting.service';

export interface JournalentryItem {
  id: string;
  name: string;
  status: string;
}

@Component({
  selector: 'virteex-accounting-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private accountingService = inject(AccountingService);
  items: JournalentryItem[] = [];

  ngOnInit() {
    this.accountingService.getJournalEntries().subscribe({
      next: (entries: any[]) => {
        this.items = entries.map(e => ({
          id: e.id,
          name: e.reference || `Entry ${e.id}`,
          status: e.status || 'Active'
        }));
      },
      error: (err) => {
        console.error('Failed to fetch journal entries', err);
        // Fallback for demo if needed, but in production we should show an error
      }
    });
  }
}
