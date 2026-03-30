import { AccountTreeNode } from './account-tree-node.model';

export interface FlattenedAccount extends AccountTreeNode {
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
}
