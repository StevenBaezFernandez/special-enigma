import { User, UserAuthenticator } from '@virteex/domain-identity-domain';
import { UserOrmEntity } from '../persistence/entities/user.orm-entity';
import { UserAuthenticatorOrmEntity } from '../persistence/entities/user-authenticator.orm-entity';

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    const user = new User(
      entity.email,
      entity.passwordHash,
      entity.firstName,
      entity.lastName,
      entity.country,
      entity.company
    );
    user.id = entity.id;
    user.timezone = entity.timezone;
    user.phone = entity.phone;
    user.avatarUrl = entity.avatarUrl;
    user.role = entity.role;
    user.isActive = entity.isActive;
    user.status = entity.status;
    user.invitationToken = entity.invitationToken;
    user.invitationExpiresAt = entity.invitationExpiresAt;
    user.riskScore = entity.riskScore;
    user.mfaEnabled = entity.mfaEnabled;
    user.mfaSecret = entity.mfaSecret;
    user.lastLoginAt = entity.lastLoginAt;
    user.failedLoginAttempts = entity.failedLoginAttempts;
    user.lockedUntil = entity.lockedUntil;
    user.googleId = entity.googleId;
    user.microsoftId = entity.microsoftId;
    user.oktaId = entity.oktaId;

    if (entity.authenticators && entity.authenticators.isInitialized()) {
      user.authenticators = entity.authenticators.getItems().map(
        (a) =>
          new UserAuthenticator(
            a.credentialID,
            a.publicKey,
            a.counter,
            a.credentialDeviceType,
            a.credentialBackedUp,
            a.transports
          )
      );
    }

    user.createdAt = entity.createdAt;
    user.updatedAt = entity.updatedAt;
    return user;
  }

  static toPersistence(domain: User): UserOrmEntity {
    const entity = new UserOrmEntity(
      domain.email,
      domain.passwordHash,
      domain.firstName,
      domain.lastName,
      domain.country,
      domain.company
    );
    entity.id = domain.id;
    entity.timezone = domain.timezone;
    entity.phone = domain.phone;
    entity.avatarUrl = domain.avatarUrl;
    entity.role = domain.role;
    entity.isActive = domain.isActive;
    entity.status = domain.status;
    entity.invitationToken = domain.invitationToken;
    entity.invitationExpiresAt = domain.invitationExpiresAt;
    entity.riskScore = domain.riskScore;
    entity.mfaEnabled = domain.mfaEnabled;
    entity.mfaSecret = domain.mfaSecret;
    entity.lastLoginAt = domain.lastLoginAt;
    entity.failedLoginAttempts = domain.failedLoginAttempts;
    entity.lockedUntil = domain.lockedUntil;
    entity.googleId = domain.googleId;
    entity.microsoftId = domain.microsoftId;
    entity.oktaId = domain.oktaId;

    if (domain.authenticators) {
      domain.authenticators.forEach((a) => {
        let authEntity = entity.authenticators.getItems().find(e => e.id === a.id);
        if (authEntity) {
          authEntity.counter = a.counter;
          authEntity.credentialBackedUp = a.credentialBackedUp;
          authEntity.transports = a.transports;
        } else {
          authEntity = new UserAuthenticatorOrmEntity(
            a.credentialID,
            a.publicKey,
            a.counter,
            a.credentialDeviceType,
            a.credentialBackedUp,
            entity,
            a.transports
          );
          authEntity.id = a.id;
          entity.authenticators.add(authEntity);
        }
      });
    }

    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
