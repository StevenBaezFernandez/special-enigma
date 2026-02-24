export class AuditLogDto {
  id!: string;
  userId?: string;
  event!: string;
  metadata?: Record<string, any>;
  timestamp!: Date;
  hash?: string;
  previousHash?: string;
}
