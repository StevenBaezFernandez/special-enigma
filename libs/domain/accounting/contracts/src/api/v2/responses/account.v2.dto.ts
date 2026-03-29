import { AccountType } from '../../../shared/enums/account-type.enum';

/**
 * Account V2 DTO with additional metadata and strict typing.
 */
export interface AccountDtoV2 {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  level: number;
  isControl: boolean;
  currency?: string;
  /** Version 2 includes audit metadata */
  metadata: {
    version: 'v2';
    createdAt: string;
    updatedAt?: string;
  };
}
