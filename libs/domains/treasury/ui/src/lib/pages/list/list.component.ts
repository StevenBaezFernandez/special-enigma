import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreasuryService } from '../../services/treasury.service';
import { CreateBankAccountDto } from '@virteex/contracts-treasury-contracts';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'virteex-treasury-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private treasuryService = inject(TreasuryService);

  refresh$ = new BehaviorSubject<void>(undefined);

  accounts$ = this.refresh$.pipe(
    switchMap(() => this.treasuryService.getBankAccounts())
  );

  newAccount: CreateBankAccountDto = {
    tenantId: 'd027735b-1793-41ec-a423-2895f5434691',
    name: '',
    accountNumber: '',
    bankName: '',
    currency: 'USD'
  };

  createAccount() {
    this.treasuryService.createBankAccount(this.newAccount).subscribe(() => {
      this.refresh$.next(undefined);
      this.newAccount = {
        ...this.newAccount,
        name: '',
        accountNumber: '',
        bankName: ''
      };
    });
  }
}
