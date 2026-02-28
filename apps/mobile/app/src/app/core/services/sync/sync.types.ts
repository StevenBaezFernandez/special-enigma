export interface SyncItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: unknown;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'failed' | 'synced';
  lastError?: string;
  conflictMessage?: string;
}

export type ConflictStrategy = 'serverWins' | 'clientWins' | 'manual';
