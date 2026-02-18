import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PurchasingInfrastructureModule } from '@virteex/purchasing-infrastructure';
import { PurchasingPresentationModule } from '@virteex/purchasing-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.PURCHASING_DB_HOST,
      port: Number(process.env.PURCHASING_DB_PORT),
      user: process.env.PURCHASING_DB_USER,
      password: process.env.PURCHASING_DB_PASSWORD,
      dbName: process.env.PURCHASING_DB_NAME,
      autoLoadEntities: true,
    }),
    PurchasingInfrastructureModule,
    PurchasingPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
