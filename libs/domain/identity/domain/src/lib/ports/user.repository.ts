import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findBySocialId(provider: 'google' | 'microsoft' | 'okta', id: string): Promise<User | null>;
  abstract findByAuthenticatorCredentialId(credentialId: string): Promise<User | null>;
  abstract findByInvitationToken(token: string): Promise<User | null>;
  abstract findByResetPasswordToken(token: string): Promise<User | null>;
}
