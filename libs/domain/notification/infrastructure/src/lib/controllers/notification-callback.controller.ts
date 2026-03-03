import { Controller, Post, Body, Headers, Logger, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Notification, NotificationStatus } from '@virteex/domain-notification-domain';
import { NotificationStateMachine } from '@virteex/domain-notification-domain';
import { validateTwilioRequest } from 'twilio'; // Twilio specific example

@Controller('webhooks/notifications')
export class NotificationCallbackController {
  private readonly logger = new Logger(NotificationCallbackController.name);

  constructor(private readonly em: EntityManager) {}

  @Post('twilio')
  async handleTwilioStatus(
    @Body() body: any,
    @Headers('x-twilio-signature') signature: string,
    @Headers('host') host: string
  ) {
    const url = `https://${host}/webhooks/notifications/twilio`;
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';

    // Signature verification for Level 5 security
    if (!validateTwilioRequest(authToken, signature, url, body)) {
      this.logger.error(`Invalid Twilio signature for message ${body.SmsSid}`);
      throw new BadRequestException('Invalid signature');
    }

    const providerMessageId = body.SmsSid;
    const status = body.SmsStatus;

    this.logger.log(`Twilio status update for ${providerMessageId}: ${status}`);
    await this.updateStatus(providerMessageId, status, body);
  }

  private async updateStatus(providerMessageId: string, providerStatus: string, rawResponse: any) {
    const notification = await this.em.findOne(Notification, { providerMessageId });
    if (!notification) {
      this.logger.warn(`No notification found for provider ID ${providerMessageId}`);
      return;
    }

    let targetStatus: NotificationStatus | null = null;
    switch (providerStatus) {
      case 'delivered': targetStatus = NotificationStatus.DELIVERED; break;
      case 'failed': targetStatus = NotificationStatus.FAILED_TERMINAL; break;
      case 'undelivered': targetStatus = NotificationStatus.FAILED_TERMINAL; break;
      case 'sent': targetStatus = NotificationStatus.SENT_PROVIDER; break;
    }

    if (targetStatus && NotificationStateMachine.canTransition(notification.status, targetStatus)) {
      NotificationStateMachine.transition(notification, targetStatus, `Provider status: ${providerStatus}`, rawResponse);
      await this.em.flush();
    }
  }
}
