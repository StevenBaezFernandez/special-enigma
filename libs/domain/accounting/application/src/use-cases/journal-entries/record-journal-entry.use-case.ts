import { JournalEntry, JournalEntryLine, type JournalEntryRepository, type AccountRepository, AccountNotFoundError, CrossTenantAccessError, PeriodClosedError, type ITelemetryService } from '@virteex/domain-accounting-domain';
import { type RecordJournalEntryDto, type JournalEntryDto } from '@virteex/domain-accounting-contracts';
import { JournalEntryMapper } from '../../mappers/journal-entry.mapper';

export class RecordJournalEntryUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository,
    private telemetryService: ITelemetryService
  ) {}

  async execute(dto: RecordJournalEntryDto & { tenantId: string }): Promise<JournalEntryDto> {
    const startTime = Date.now();
    this.telemetryService.setTraceAttributes({ tenantId: dto.tenantId, useCase: 'RecordJournalEntry' });

    const handleExecute = async () => {
        const latestClosedDate = await this.journalEntryRepository.findLatestClosedDate(dto.tenantId);
        if (latestClosedDate && new Date(dto.date) <= latestClosedDate) {
            throw new PeriodClosedError(new Date(dto.date));
        }

        const entry = new JournalEntry(dto.tenantId, dto.description, dto.date);

        for (const lineDto of dto.lines) {
            const account = await this.accountRepository.findById(dto.tenantId, lineDto.accountId);
            if (!account) {
                throw new AccountNotFoundError(lineDto.accountId);
            }

            if (account.tenantId !== dto.tenantId) {
                throw new CrossTenantAccessError();
            }

            const line = new JournalEntryLine(account, lineDto.debit, lineDto.credit);
            line.description = lineDto.description;
            entry.addLine(line);
        }

        entry.validateBalance();

        const savedEntry = await this.journalEntryRepository.create(entry);

        const duration = Date.now() - startTime;
        this.telemetryService.recordBusinessMetric('accounting_record_journal_entry_latency_ms', duration, { tenantId: dto.tenantId });
        this.telemetryService.recordBusinessMetric('accounting_record_journal_entry_success_total', 1, { tenantId: dto.tenantId });

        return JournalEntryMapper.toDto(savedEntry);
    };

    const transactionalRepo = this.journalEntryRepository as any;
    const promise = transactionalRepo.transactional ? transactionalRepo.transactional(handleExecute) : handleExecute();

    return promise.catch(error => {
      const duration = Date.now() - startTime;
      this.telemetryService.recordBusinessMetric('accounting_record_journal_entry_error_total', 1, {
        tenantId: dto.tenantId,
        error: (error as Error).message
      });
      throw error;
    });
  }
}
