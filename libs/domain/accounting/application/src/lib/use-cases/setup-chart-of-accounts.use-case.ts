import { Account, type AccountRepository } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-domain';

export class SetupChartOfAccountsUseCase {
  constructor(
    private accountRepository: AccountRepository
  ) {}

  async execute(tenantId: string): Promise<void> {
    const existing = await this.accountRepository.findAll(tenantId);
    if (existing.length > 0) return;

    const defaults = [
        { code: '1000', name: 'Activos', type: AccountType.ASSET },
        { code: '1100', name: 'Efectivo y Equivalentes', type: AccountType.ASSET },
        { code: '105.01', name: 'Clientes Locales', type: AccountType.ASSET },
        { code: '102.01', name: 'Bancos Nacionales', type: AccountType.ASSET },
        { code: '2000', name: 'Pasivos', type: AccountType.LIABILITY },
        { code: '208.01', name: 'IVA por Pagar', type: AccountType.LIABILITY },
        { code: '210.01', name: 'Impuestos por Pagar (Nómina)', type: AccountType.LIABILITY },
        { code: '3000', name: 'Capital', type: AccountType.EQUITY },
        { code: '4000', name: 'Ingresos', type: AccountType.REVENUE },
        { code: '401.01', name: 'Ventas Gravadas', type: AccountType.REVENUE },
        { code: '5000', name: 'Gastos', type: AccountType.EXPENSE },
        { code: '601.01', name: 'Sueldos y Salarios', type: AccountType.EXPENSE },
    ];

    await this.accountRepository.transactional(async () => {
      for (const d of defaults) {
        await this.accountRepository.create(new Account(tenantId, d.code, d.name, d.type));
      }
    });
  }
}
