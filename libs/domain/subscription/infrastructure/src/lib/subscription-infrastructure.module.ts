import { Module, Global, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SUBSCRIPTION_REPOSITORY, SUBSCRIPTION_PLAN_REPOSITORY, CUSTOMER_REGISTRY_GATEWAY, SUBSCRIPTION_PROVIDER_GATEWAY, PAYMENT_SESSION_PROVIDER } from '@virteex/domain-subscription-domain';
import { IProcessCheckoutSuccessUseCase, IHandleInvoicePaidUseCase, IHandleSubscriptionUpdatedUseCase, IHandleSubscriptionDeletedUseCase } from '@virteex/domain-subscription-contracts';
import { EVENT_BUS_PORT, LOGGER_PORT } from '@virteex/domain-subscription-application';
import { SubscriptionPersistenceModule } from './subscription-persistence.module';
import { ProcessCheckoutSuccessUseCase, HandleInvoicePaidUseCase, HandleSubscriptionUpdatedUseCase, HandleSubscriptionDeletedUseCase } from '@virteex/domain-subscription-application';

import { MikroOrmSubscriptionRepository } from './repositories/mikro-orm-subscription.repository';
import { MikroOrmSubscriptionPlanRepository } from './repositories/mikro-orm-subscription-plan.repository';
import { StripeSubscriptionAdapter } from './adapters/stripe-subscription.adapter';
import { StripeSubscriptionListener } from './listeners/stripe-subscription.listener';
import { SubscriptionSchema, SubscriptionPlanSchema } from './persistence/subscription.schemas';

@Global()
@Module({
  imports: [
    SubscriptionPersistenceModule,
    MikroOrmModule.forFeature([
      SubscriptionSchema,
      SubscriptionPlanSchema
    ])
  ],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MikroOrmSubscriptionRepository
    },
    {
      provide: SUBSCRIPTION_PLAN_REPOSITORY,
      useClass: MikroOrmSubscriptionPlanRepository
    },
    {
      provide: CUSTOMER_REGISTRY_GATEWAY,
      useClass: StripeSubscriptionAdapter
    },
    {
      provide: SUBSCRIPTION_PROVIDER_GATEWAY,
      useClass: StripeSubscriptionAdapter
    },
    {
      provide: PAYMENT_SESSION_PROVIDER,
      useClass: StripeSubscriptionAdapter
    },
    {
      provide: IProcessCheckoutSuccessUseCase,
      useClass: ProcessCheckoutSuccessUseCase
    },
    {
      provide: IHandleInvoicePaidUseCase,
      useClass: HandleInvoicePaidUseCase
    },
    {
      provide: IHandleSubscriptionUpdatedUseCase,
      useClass: HandleSubscriptionUpdatedUseCase
    },
    {
      provide: IHandleSubscriptionDeletedUseCase,
      useClass: HandleSubscriptionDeletedUseCase
    },
    {
      provide: EVENT_BUS_PORT,
      useExisting: EventEmitter2
    },
    {
      provide: LOGGER_PORT,
      useValue: new Logger()
    },
    ProcessCheckoutSuccessUseCase,
    HandleInvoicePaidUseCase,
    HandleSubscriptionUpdatedUseCase,
    HandleSubscriptionDeletedUseCase,
    StripeSubscriptionListener
  ],
  exports: [
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_PLAN_REPOSITORY,
    CUSTOMER_REGISTRY_GATEWAY,
    SUBSCRIPTION_PROVIDER_GATEWAY,
    PAYMENT_SESSION_PROVIDER,
    EVENT_BUS_PORT,
    LOGGER_PORT,
    MikroOrmModule
  ]
})
export class SubscriptionInfrastructureModule {}
