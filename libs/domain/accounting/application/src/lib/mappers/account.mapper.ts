import { Account, AccountType } from '@virteex/domain-accounting-domain';
import { type AccountDto, AccountType as AccountTypeDto } from '@virteex/domain-accounting-contracts';

export class AccountMapper {
  static toDto(entity: Account): AccountDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      type: entity.type as unknown as AccountTypeDto,
      level: entity.level,
      isControl: entity.isControl,
      currency: entity.currency,
      parentId: entity.parent?.id,
      balance: 0 // Default or placeholder balance
    };
  }
}
