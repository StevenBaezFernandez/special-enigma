import { Account } from '@virteex/domain-accounting-contracts';

export interface AccountUiModel extends Account {
  level?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
}
