import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TreasuryInfrastructureModule } from '@virteex/treasury-infrastructure';
import { TreasuryPresentationModule } from '@virteex/treasury-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.TREASURY_DB_HOST,
      port: Number(process.env.TREASURY_DB_PORT),
      user: process.env.TREASURY_DB_USER,
      password: process.env.TREASURY_DB_PASSWORD,
      dbName: process.env.TREASURY_DB_NAME,
      autoLoadEntities: true,
    }),
    TreasuryInfrastructureModule,
    TreasuryPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
