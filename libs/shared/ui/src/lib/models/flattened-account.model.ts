import { Account } from './account.model';

export interface FlattenedAccount extends Account {
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
}
