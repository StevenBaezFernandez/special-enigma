import { Controller, Post, Headers, Req, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessStripeWebhookUseCase } from '@virteex/domain-subscription-application';
import Stripe from 'stripe';
import { resolveStripeSecretKey } from '@virteex/domain-subscription-domain';

@Controller('stripe/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private stripe: Stripe;
  private endpointSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly processStripeWebhookUseCase: ProcessStripeWebhookUseCase
  ) {
    const secretKey = resolveStripeSecretKey(
      this.configService.get<string>('NODE_ENV'),
      this.configService.get<string>('STRIPE_SECRET_KEY')
    );
    this.endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
    } as any);
  }

  @Post()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    if (!signature) {
       throw new BadRequestException('Missing stripe-signature header');
    }
    if (!this.endpointSecret) {
       this.logger.error('Stripe webhook secret is not configured');
       throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      if (!req.rawBody) {
        throw new Error('Raw body not available on request. Ensure raw body parsing is enabled.');
      }
      event = this.stripe.webhooks.constructEvent(req.rawBody, signature, this.endpointSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (!event) {
        throw new BadRequestException('Invalid event');
    }

    await this.processStripeWebhookUseCase.execute(event);

    return { received: true };
  }
}
