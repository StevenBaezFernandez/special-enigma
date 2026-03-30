export enum HierarchyType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface AccountTreeNode {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  children?: AccountTreeNode[];
  type: HierarchyType;
}
