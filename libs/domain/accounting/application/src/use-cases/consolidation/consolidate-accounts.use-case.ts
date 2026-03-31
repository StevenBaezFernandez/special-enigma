import { type JournalEntryRepository, type AccountRepository, type PolicyRepository, JournalEntry, JournalEntryLine, JournalEntryType, JournalEntryStatus } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

export class ConsolidateAccountsUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository,
    private policyRepository: PolicyRepository
  ) {}

  /**
   * Consolidates balances from multiple source tenants into a target consolidation tenant.
   * @param targetTenantId The tenant where consolidated entries will be recorded.
   * @param sourceTenantIds List of tenants to consolidate.
   * @param asOfDate Date up to which balances should be consolidated.
   */
  async execute(targetTenantId: string, sourceTenantIds: string[], asOfDate: Date): Promise<void> {
    const startTime = Date.now();
    console.log(`[SLO] Starting consolidation for target tenant ${targetTenantId} at ${new Date().toISOString()}`);

    // Fetch target accounts once to optimize lookups
    const targetAccounts = await this.accountRepository.findAll(targetTenantId);
    const targetAccountsByCode = new Map(targetAccounts.map(a => [a.code, a]));

    const policy = await this.policyRepository.findByTenantAndType(targetTenantId, 'consolidation');
    const mapping = (policy?.rules['mapping'] as Record<string, string>) || {};
    const eliminations = (policy?.rules['eliminations'] as string[]) || [];
    const adjustmentAccountCode = (policy?.rules['adjustmentAccountCode'] as string) || '9999';

    for (const sourceTenantId of sourceTenantIds) {
      const balances = await this.journalEntryRepository.getBalancesByAccount(sourceTenantId, undefined, asOfDate);
      const sourceAccounts = await this.accountRepository.findAll(sourceTenantId);
      const sourceAccountsById = new Map(sourceAccounts.map(a => [a.id, a]));

      const entry = new JournalEntry(
        targetTenantId,
        `Consolidation from ${sourceTenantId} as of ${asOfDate.toISOString().split('T')[0]}`,
        asOfDate
      );
      entry.type = JournalEntryType.CONSOLIDATION;

      let totalDebit = new Decimal(0);
      let totalCredit = new Decimal(0);

      for (const [accountId, balance] of balances.entries()) {
        const account = sourceAccountsById.get(accountId);
        if (!account) continue;

        // Check for explicit mapping, then fallback to same code
        const targetCode = mapping[account.code] || account.code;

        // Apply eliminations (skip if account is in elimination list)
        if (eliminations.includes(account.code)) {
            console.log(`[CONSOLIDATION] Eliminating intercompany account ${account.code} from source ${sourceTenantId}`);
            continue;
        }

        let targetAccount = targetAccountsByCode.get(targetCode);

        if (!targetAccount) {
            console.warn(`[CONSOLIDATION] No target account found for code ${targetCode} (source: ${account.code})`);
            continue;
        }

        if (new Decimal(balance.debit).gt(0) || new Decimal(balance.credit).gt(0)) {
            entry.addLine(new JournalEntryLine(targetAccount, balance.debit, balance.credit));
            totalDebit = totalDebit.plus(new Decimal(balance.debit));
            totalCredit = totalCredit.plus(new Decimal(balance.credit));
        }
      }

      if (entry.lines.length > 0) {
        const diff = totalDebit.minus(totalCredit);
        if (!diff.isZero()) {
            const adjustmentAccount = targetAccountsByCode.get(adjustmentAccountCode);
            if (adjustmentAccount) {
                const debit = diff.isNegative() ? diff.abs().toFixed(2) : '0.00';
                const credit = diff.isPositive() ? diff.abs().toFixed(2) : '0.00';
                entry.addLine(new JournalEntryLine(adjustmentAccount, debit, credit));
                console.log(`[CONSOLIDATION] Added adjustment of ${diff.abs().toFixed(2)} to account ${adjustmentAccountCode}`);
            }
        }

        entry.status = JournalEntryStatus.POSTED;
        entry.validateBalance();
        await this.journalEntryRepository.create(entry);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[SLO] Consolidation for target tenant ${targetTenantId} completed in ${duration}ms`);
  }
}
