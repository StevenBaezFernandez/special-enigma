import { SetMetadata } from '@nestjs/common';

export const STEP_UP_KEY = 'step_up_required';

export interface StepUpOptions {
  maxAgeSeconds?: number;
  action: 'billing' | 'mass-export' | 'credentials-change' | 'api-keys' | 'tenant-admin' | 'plugin-admin' | 'operations-admin';
}

export const StepUp = (options: StepUpOptions) => SetMetadata(STEP_UP_KEY, options);
