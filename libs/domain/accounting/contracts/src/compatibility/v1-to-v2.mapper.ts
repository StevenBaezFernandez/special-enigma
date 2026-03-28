import { type AccountCreatedEventV1 } from '../events/v1/account-created.event';

/**
 * Mapper for backward compatibility between contract versions.
 * Currently serves as a placeholder for the v1 to v2 migration.
 */
export class ContractCompatibilityMapper {
  static mapV1ToV2(event: AccountCreatedEventV1): any {
    return {
      ...event,
      version: 'v2',
      metadata: {
        mappedAt: new Date().toISOString()
      }
    };
  }
}
