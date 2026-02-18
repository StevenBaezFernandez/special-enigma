import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceConsumer } from './invoice.consumer';
import { KafkaModule } from '@virteex/shared/infrastructure/kafka';
import { FiscalPresentationModule } from '@virteex/fiscal-presentation';
import { FiscalInfrastructureModule } from '@virteex/fiscal-infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.FISCAL_DB_HOST,
      port: Number(process.env.FISCAL_DB_PORT),
      user: process.env.FISCAL_DB_USER,
      password: process.env.FISCAL_DB_PASSWORD,
      dbName: process.env.FISCAL_DB_NAME,
      autoLoadEntities: true,
    }),
    KafkaModule.forRoot({
      clientId: 'fiscal-service',
      groupId: 'fiscal-consumer',
    }),
    FiscalInfrastructureModule,
    FiscalPresentationModule,
  ],
  controllers: [AppController, InvoiceConsumer],
  providers: [AppService],
})
export class AppModule {}
