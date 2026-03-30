import { type AccountDto } from '../api/v1/responses/account.dto';
import { type AccountDtoV2 } from '../api/v2/responses/account.v2.dto';
import { type JournalEntryDto } from '../api/v1/responses/journal-entry.dto';
import { type JournalEntryDtoV2 } from '../api/v2/responses/journal-entry.v2.dto';

/**
 * Mapper for backward compatibility between contract versions.
 */
export class ContractCompatibilityMapper {
  /**
   * Maps an Account V1 DTO to a V2 DTO.
   */
  static mapAccountV1ToV2(v1: AccountDto): AccountDtoV2 {
    return {
      id: v1.id,
      tenantId: v1.tenantId,
      code: v1.code,
      name: v1.name,
      type: v1.type,
      parentId: v1.parentId,
      level: v1.level,
      isControl: v1.isControl,
      currency: v1.currency,
      metadata: {
        version: 'v2',
        createdAt: new Date().toISOString()
      }
    };
  }

  /**
   * Maps a JournalEntry V1 DTO to a V2 DTO.
   */
  static mapJournalEntryV1ToV2(v1: JournalEntryDto): JournalEntryDtoV2 {
    return {
      ...v1,
      totalDebit: v1.amount,
      totalCredit: v1.amount
    };
  }
}
