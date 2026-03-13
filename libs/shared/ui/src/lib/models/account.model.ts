export enum HierarchyType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface Account {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  children?: Account[];
  type: HierarchyType;
}
