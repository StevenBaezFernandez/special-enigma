import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceConsumer } from './invoice.consumer';
import { KafkaModule } from '@virteex/platform-kafka';
import { FiscalPresentationModule } from '@virteex/domain-fiscal-presentation';
import {
  FiscalInfrastructureModule,
  DianFiscalAdapter,
  SatFiscalAdapter,
  SefazFiscalAdapter,
  UsTaxPartnerFiscalAdapter,
} from '@virteex/domain-fiscal-infrastructure';
import { HttpModule, HttpService } from '@nestjs/axios';

type FiscalCountryStatus = {
  status: 'GA' | 'Beta' | 'No listo';
  provider: string;
  allowSimulation: boolean;
};

function loadFiscalCommercialEligibility(): Record<string, FiscalCountryStatus> {
  const matrixPath = path.resolve(process.cwd(), 'config/readiness/commercial-eligibility.matrix.json');
  const raw = fs.readFileSync(matrixPath, 'utf8');
  const matrix = JSON.parse(raw);
  return matrix.modules.fiscal;
}

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
        const fiscalEligibility = loadFiscalCommercialEligibility();
        const provider = (config.get('FISCAL_PROVIDER') || '').toUpperCase();
        const country = (config.get('FISCAL_COUNTRY') || '').toUpperCase();
        const nodeEnv = (config.get('NODE_ENV') || 'development').toLowerCase();

        const eligibility = fiscalEligibility[country];
        if (!eligibility) {
          throw new Error(`Fiscal country '${country || 'undefined'}' is not commercially eligible for activation.`);
        }

        if (eligibility.status === 'No listo') {
          throw new Error(`Fiscal module is '${eligibility.status}' for ${country}; activation is blocked.`);
        }

        if (provider !== eligibility.provider) {
          throw new Error(
            `Country ${country} requires provider '${eligibility.provider}', but got '${provider || 'undefined'}'.`
          );
        }

        if (nodeEnv === 'production' && eligibility.allowSimulation) {
          throw new Error(`Country ${country} has allowSimulation=true and cannot be activated in production.`);
        }

        if (provider === 'DIAN') {
          return new DianFiscalAdapter(http);
        }
        if (provider === 'SEFAZ') {
          return new SefazFiscalAdapter(http);
        }
        if (provider === 'SAT') {
          return new SatFiscalAdapter(http, config);
        }
        if (provider === 'TAX_PARTNER') {
          return new UsTaxPartnerFiscalAdapter(http, config);
        }
        throw new Error(`Invalid FISCAL_PROVIDER value: ${provider || 'undefined'}. Configure SAT, SEFAZ, DIAN or TAX_PARTNER.`);
      },
    },
  ],
})
export class AppModule {}
