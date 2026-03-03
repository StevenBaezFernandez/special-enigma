import { SetMetadata } from '@nestjs/common';

export const ABAC_KEY = 'abac_policy';

export interface AbacPolicy {
  subjectAttr: string;
  objectAttr: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  matcher: (subjectValue: any, objectValue: any) => boolean;
}

export const Abac = (policy: AbacPolicy) => SetMetadata(ABAC_KEY, policy);
