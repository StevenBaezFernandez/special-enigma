import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string, tenantId?: string): Promise<User | null>;
  abstract findBySocialId(provider: 'google' | 'microsoft' | 'okta', id: string): Promise<User | null>;
  abstract findByAuthenticatorCredentialId(credentialId: string): Promise<User | null>;
  abstract findByInvitationToken(token: string): Promise<User | null>;
  abstract findByResetPasswordToken(token: string): Promise<User | null>;
  abstract findAll(options: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortColumn?: string;
    sortDirection?: 'ASC' | 'DESC';
    tenantId?: string;
  }): Promise<{ data: User[]; total: number }>;
  abstract delete(id: string, tenantId?: string): Promise<void>;
}
