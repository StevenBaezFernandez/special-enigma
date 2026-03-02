import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserRepository, AuthService, UserInvitedEvent } from '@virteex/domain-identity-domain';
import { InviteUserDto } from '@virteex/domain-identity-contracts';
import { randomUUID } from 'crypto';

@Injectable()
export class InviteUserUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: InviteUserDto, currentUserId: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new DomainException('User already exists', 'CONFLICT');
    }

    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser) throw new Error('Inviter not found');

    const token = randomUUID();
    const passwordHash = await this.authService.hashPassword(randomUUID());

    const user = new User(
      dto.email,
      passwordHash,
      dto.firstName,
      dto.lastName,
      currentUser.country,
      currentUser.company
    );
    user.role = dto.role;
    user.status = 'INVITED';
    user.invitationToken = token;
    user.invitationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepository.save(user);

    this.eventEmitter.emit('user.invited', new UserInvitedEvent(user, token));

    return user;
  }
}
