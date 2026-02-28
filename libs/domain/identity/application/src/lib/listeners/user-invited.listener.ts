import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService, UserInvitedEvent } from '@virteex/domain-identity-domain';

@Injectable()
export class UserInvitedListener {
  private readonly logger = new Logger(UserInvitedListener.name);

  constructor(
    @Inject(NotificationService) private readonly notificationService: NotificationService
  ) {}

  @OnEvent('user.invited')
  async handleUserInvitedEvent(event: UserInvitedEvent) {
    this.logger.log(`Handling user.invited event for ${event.user.email}`);
    try {
      await this.notificationService.sendInvitationEmail(event.user, event.token);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${event.user.email}`, error);
    }
  }
}
