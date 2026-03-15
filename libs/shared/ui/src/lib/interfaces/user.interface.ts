import { UserStatus } from '../enums/user-status.enum';
import { Role } from '../models/user-dtos';
import { User as AuthUser } from '@virteex/shared-util-auth';

export { Role };

export interface Organization {
  id: string;
  name?: string;
  logoUrl?: string;
  subscriptionStatus?: string;
  gracePeriodEnd?: Date | string;
}

export interface User extends AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  status: UserStatus;
  permissions: string[];
  token: string;
  isOnline: boolean;
  department?: string;
  avatarUrl?: string;
  online: boolean;
  phone?: string;
  jobTitle?: string;
  passwordHash: string | null;
  isImpersonating?: boolean;
  originalUserId?: string;
  organization: Organization;
  preferredLanguage?: string;
  isTwoFactorEnabled?: boolean;
}
