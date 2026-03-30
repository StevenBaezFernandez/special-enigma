import { AccountType } from '../shared/enums/account-type.enum';

export interface ICreateAccount {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
}
