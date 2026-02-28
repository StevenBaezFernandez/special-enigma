import { AccountType } from '../enums/account-type.enum';

export interface AccountDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  level: number;
  isControl: boolean;
  currency?: string;
  parentId?: string;
}
