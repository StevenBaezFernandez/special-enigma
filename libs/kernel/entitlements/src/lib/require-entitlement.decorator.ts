import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { EntitlementGuard } from './entitlement.guard';

export const ENTITLEMENT_KEY = 'required-entitlement';

export const RequireEntitlement = (feature: string) => {
  return applyDecorators(
    SetMetadata(ENTITLEMENT_KEY, feature),
    UseGuards(EntitlementGuard)
  );
};
