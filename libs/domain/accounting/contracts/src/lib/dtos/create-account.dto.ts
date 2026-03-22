import { AccountType } from '../enums/account-type.enum';

export interface CreateAccountDto {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
}
