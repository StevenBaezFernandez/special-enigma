import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceConsumer } from './invoice.consumer';
import { KafkaModule } from '@virteex/shared-infrastructure-kafka';
import { FiscalPresentationModule } from '@virteex/api-fiscal-presentation';
import { FiscalInfrastructureModule, DianFiscalAdapter, SatFiscalAdapter } from '@virteex/infra-fiscal-infrastructure';
import { HttpModule, HttpService } from '@nestjs/axios';

const FISCAL_COMMERCIAL_ELIGIBILITY: Record<string, { status: 'GA' | 'Beta' | 'No listo'; provider: string }> = {
  MX: { status: 'GA', provider: 'SAT' },
  BR: { status: 'Beta', provider: 'SEFAZ' },
  CO: { status: 'Beta', provider: 'DIAN' },
  US: { status: 'Beta', provider: 'TAX_PARTNER' }
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        driver: PostgreSqlDriver,
        host: configService.get<string>('FISCAL_DB_HOST'),
        port: configService.get<number>('FISCAL_DB_PORT'),
        user: configService.get<string>('FISCAL_DB_USER'),
        password: configService.get<string>('FISCAL_DB_PASSWORD'),
        dbName: configService.get<string>('FISCAL_DB_NAME'),
        autoLoadEntities: true,
      }),
    }),
    KafkaModule.forRoot({
      clientId: 'fiscal-service',
      groupId: 'fiscal-consumer',
    }),
    FiscalInfrastructureModule,
    FiscalPresentationModule,
  ],
  controllers: [AppController, InvoiceConsumer],
  providers: [
    AppService,
    {
      provide: 'FiscalProvider',
      inject: [ConfigService, HttpService],
      useFactory: (config: ConfigService, http: HttpService) => {
        const provider = (config.get('FISCAL_PROVIDER') || '').toUpperCase();
        const country = (config.get('FISCAL_COUNTRY') || '').toUpperCase();

        const eligibility = FISCAL_COMMERCIAL_ELIGIBILITY[country];
        if (!eligibility) {
          throw new Error(`Fiscal country '${country || 'undefined'}' is not commercially eligible for activation.`);
        }

        if (eligibility.status === 'No listo') {
          throw new Error(`Fiscal module is '${eligibility.status}' for ${country}; activation is blocked.`);
        }

        if (provider !== eligibility.provider && eligibility.status === 'GA') {
          throw new Error(
            `Country ${country} is ${eligibility.status}; provider '${provider || 'undefined'}' does not match required provider '${eligibility.provider}'.`
          );
        }

        if (provider === 'DIAN') {
          return new DianFiscalAdapter(http);
        }
        if (provider === 'SAT') {
          return new SatFiscalAdapter(http);
        }
        throw new Error(`Invalid FISCAL_PROVIDER value: ${provider || 'undefined'}. Configure DIAN or SAT.`);
      },
    },
  ],
})
export class AppModule {}
