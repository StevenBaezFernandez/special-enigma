import { User, Role } from '../interfaces/user.interface';

export interface InviteUserDto {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  preferredLanguage?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
  phone?: string;
  jobTitle?: string;
  email?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
}
