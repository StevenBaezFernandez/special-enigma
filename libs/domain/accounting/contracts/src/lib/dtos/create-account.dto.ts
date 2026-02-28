import { AccountType } from '../enums/account-type.enum';

export interface CreateAccountDto {
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
}
