import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AccountingApplicationWiringModule } from '@virteex/domain-accounting-infrastructure';
import { AccountingRestModule } from './modules/accounting-rest.module';
import { AccountingGraphqlModule } from './modules/accounting-graphql.module';
import { AccountingEventsModule } from './modules/accounting-events.module';
import { AccountingExceptionFilter } from './filters/accounting-exception.filter';
import { TenantGuard } from '@virteex/kernel-auth';
import { PresentationLoggingInterceptor } from './interceptors/presentation-logging.interceptor';

/**
 * Presentation module for the Accounting domain.
 * This module aggregates REST, GraphQL, and Event-driven modules.
 */
@Module({
  imports: [
    AccountingApplicationWiringModule,
    TerminusModule,
    ConfigModule,
    AccountingRestModule,
    AccountingGraphqlModule,
    AccountingEventsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AccountingExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PresentationLoggingInterceptor,
    },
  ],
  exports: [AccountingGraphqlModule]
})
export class AccountingPresentationModule {}
