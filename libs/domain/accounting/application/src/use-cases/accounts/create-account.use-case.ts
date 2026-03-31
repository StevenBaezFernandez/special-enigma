import { Account, AccountType, AccountAlreadyExistsError, ParentAccountNotFoundError, type AccountRepository, type OutboxRepository, AccountCreated } from '@virteex/domain-accounting-domain';
import { type ITelemetryService } from '@virteex/kernel-telemetry';
import { type CreateAccountDto, type AccountDto } from '@virteex/domain-accounting-contracts';
import { AccountMapper } from '../../mappers/account.mapper';

export class CreateAccountUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private outboxRepository: OutboxRepository,
    private telemetryService: ITelemetryService
  ) {}

  async execute(dto: CreateAccountDto & { tenantId: string }): Promise<AccountDto> {
    const startTime = Date.now();
    this.telemetryService.setTraceAttributes({ tenantId: dto.tenantId, useCase: 'CreateAccount' });

    return this.accountRepository.transactional(async () => {
        const existing = await this.accountRepository.findByCode(dto.tenantId, dto.code);
        if (existing) {
            throw new AccountAlreadyExistsError(dto.code);
        }

        const account = new Account(dto.tenantId, dto.code, dto.name, dto.type as unknown as AccountType);

        if (dto.parentId) {
            const parent = await this.accountRepository.findById(dto.tenantId, dto.parentId);
            if (!parent) {
                throw new ParentAccountNotFoundError(dto.parentId);
            }
            account.setParent(parent);
        }

        const savedAccount = await this.accountRepository.create(account);

        savedAccount.recordEvent(new AccountCreated(
            savedAccount.id || 'temp-id',
            savedAccount.tenantId,
            savedAccount.code,
            savedAccount.name
        ));

        for (const event of savedAccount.domainEvents) {
            await this.outboxRepository.save({
                id: crypto.randomUUID(),
                aggregateId: event.aggregateId,
                aggregateType: 'Account',
                eventType: event.eventName,
                payload: event,
                createdAt: new Date(),
                tenantId: event.tenantId
            });
        }

        savedAccount.clearEvents();

        const duration = Date.now() - startTime;
        this.telemetryService.recordBusinessMetric('accounting_create_account_latency_ms', duration, { tenantId: dto.tenantId });
        this.telemetryService.recordBusinessMetric('accounting_create_account_success_total', 1, { tenantId: dto.tenantId });

        return AccountMapper.toDto(savedAccount);
    }).catch(error => {
        this.telemetryService.recordBusinessMetric('accounting_create_account_error_total', 1, {
            tenantId: dto.tenantId,
            error: error.message
        });
        throw error;
    });
  }
}
