import { AuditLog } from '@virteex/domain-identity-domain';
import { AuditLogDto } from '@virteex/contracts-identity-contracts';

export class AuditLogMapper {
  static toDto(entity: AuditLog): AuditLogDto {
    return {
      id: entity.id,
      userId: entity.userId,
      event: entity.event,
      metadata: entity.metadata,
      timestamp: entity.timestamp,
      hash: entity.hash,
      previousHash: entity.previousHash
    };
  }

  static toDtoList(entities: AuditLog[]): AuditLogDto[] {
    return entities.map(entity => this.toDto(entity));
  }
}
