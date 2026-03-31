import { type JournalEntryRepository, type AccountRepository, type FiscalPeriodRepository, type ClosingTaskRepository, JournalEntry, JournalEntryLine, JournalEntryType, AccountingDomainError, AccountType, JournalEntryStatus, FiscalPeriodStatus, ClosingTaskStatus } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';
import { AccountingPolicyService } from '../../services/accounting-policy.service';


export class CloseFiscalPeriodUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository,
    private fiscalPeriodRepository: FiscalPeriodRepository,
    private closingTaskRepository: ClosingTaskRepository,
    private policyService: AccountingPolicyService
  ) {}

  async execute(tenantId: string, closingDate: Date, userId: string = 'system'): Promise<void> {
    const startTime = Date.now();
    console.log(`[SLO] Starting fiscal closing for tenant ${tenantId} as of ${closingDate.toISOString()}`);

    const period = await this.fiscalPeriodRepository.findByDate(tenantId, closingDate);
    if (!period) {
        throw new AccountingDomainError(`No fiscal period found for date ${closingDate.toISOString()}`);
    }

    if (period.status === FiscalPeriodStatus.CLOSED) {
        throw new AccountingDomainError('Fiscal period is already closed.');
    }

    // Check closing tasks
    const tasks = await this.closingTaskRepository.findByFiscalPeriod(tenantId, period.id);
    const incompleteTasks = tasks.filter(t => t.status !== ClosingTaskStatus.COMPLETED);
    if (incompleteTasks.length > 0) {
        throw new AccountingDomainError(`Cannot close period: ${incompleteTasks.length} closing tasks are incomplete.`);
    }

    // Pre-closing validations: Ensure all journal entries for the period are POSTED
    const unpostedEntries = await this.journalEntryRepository.findUnpostedEntries(tenantId, closingDate);
    if (unpostedEntries.length > 0) {
        throw new AccountingDomainError(`Cannot close period: ${unpostedEntries.length} entries are still in DRAFT or PENDING_APPROVAL status.`);
    }

    const balances = await this.journalEntryRepository.getBalancesByAccount(tenantId, undefined, closingDate);
    const accounts = await this.accountRepository.findAll(tenantId);

    let netIncome = new Decimal(0);
    const closingEntries: { accountId: string, amount: Decimal }[] = [];

    for (const account of accounts) {
      if (account.type === AccountType.REVENUE || account.type === AccountType.EXPENSE) {
        const balance = balances.get(account.id) || { debit: '0', credit: '0' };
        const amount = new Decimal(balance.debit).minus(new Decimal(balance.credit));
        netIncome = netIncome.plus(amount);
        closingEntries.push({ accountId: account.id, amount });
      }
    }

    if (closingEntries.length === 0) return;

    const entry = new JournalEntry(tenantId, `Fiscal Closing - ${closingDate.toISOString().substring(0, 7)}`, closingDate);

    for (const item of closingEntries) {
        const account = await this.accountRepository.findById(tenantId, item.accountId);
        if (!account) continue;

        const debit = item.amount.isPositive() ? '0.00' : item.amount.abs().toFixed(2);
        const credit = item.amount.isPositive() ? item.amount.abs().toFixed(2) : '0.00';

        entry.addLine(new JournalEntryLine(account, debit, credit));
    }

    const policy = await this.policyService.resolveAccountsForClosing(tenantId);
    const retainedEarningsAccount = await this.accountRepository.findByCode(tenantId, policy['retainedEarningsAccountCode']);

    if (retainedEarningsAccount) {
        const debit = netIncome.isPositive() ? netIncome.abs().toFixed(2) : '0.00';
        const credit = netIncome.isPositive() ? '0.00' : netIncome.abs().toFixed(2);
        entry.addLine(new JournalEntryLine(retainedEarningsAccount, debit, credit));
    } else if (!netIncome.isZero()) {
        throw new AccountingDomainError(`Retained earnings account with code ${policy['retainedEarningsAccountCode']} not found for fiscal closing.`);
    }

    entry.type = JournalEntryType.CLOSING;
    entry.status = JournalEntryStatus.POSTED;
    entry.validateBalance();
    await this.journalEntryRepository.create(entry);

    period.close(userId);
    await this.fiscalPeriodRepository.save(period);

    const duration = Date.now() - startTime;
    console.log(`[SLO] Fiscal closing for tenant ${tenantId} completed in ${duration}ms`);
  }

  async reopen(tenantId: string, closingDate: Date, userId: string = 'system'): Promise<void> {
      console.log(`[AUDIT] Re-opening fiscal period for tenant ${tenantId} as of ${closingDate.toISOString()} by user ${userId}`);

      const period = await this.fiscalPeriodRepository.findByDate(tenantId, closingDate);
      if (period) {
          period.reopen();
          await this.fiscalPeriodRepository.save(period);
      }

      const entries = await this.journalEntryRepository.findAll(tenantId);
      const closingEntry = entries.find(e =>
          e.type === JournalEntryType.CLOSING &&
          e.date.getTime() === closingDate.getTime() &&
          e.status === JournalEntryStatus.POSTED
      );

      if (closingEntry) {
          closingEntry.status = JournalEntryStatus.VOID;
          await this.journalEntryRepository.create(closingEntry); // Assuming create handles update if ID exists

          // Formal Reversal Entry
          const reversalEntry = new JournalEntry(
              tenantId,
              `Reversal of Fiscal Closing - ${closingDate.toISOString().substring(0, 7)}`,
              new Date()
          );
          reversalEntry.type = JournalEntryType.ADJUSTMENT;
          for (const line of closingEntry.lines) {
              reversalEntry.addLine(new JournalEntryLine(line.account, line.credit, line.debit));
          }
          reversalEntry.status = JournalEntryStatus.POSTED;
          await this.journalEntryRepository.create(reversalEntry);

          console.log(`[AUDIT] Closing entry ${closingEntry.id} voided and reversed for re-opening.`);
      }
  }
}
