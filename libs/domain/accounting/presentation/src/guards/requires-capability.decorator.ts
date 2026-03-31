import { SetMetadata } from '@nestjs/common';

export const CAPABILITIES_KEY = 'capabilities';
export const RequiresCapability = (...capabilities: string[]) => SetMetadata(CAPABILITIES_KEY, capabilities);
