import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ManufacturingInfrastructureModule } from '@virteex/manufacturing-infrastructure';
import { ManufacturingPresentationModule } from '@virteex/manufacturing-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.MANUFACTURING_DB_HOST,
      port: Number(process.env.MANUFACTURING_DB_PORT),
      user: process.env.MANUFACTURING_DB_USER,
      password: process.env.MANUFACTURING_DB_PASSWORD,
      dbName: process.env.MANUFACTURING_DB_NAME,
      autoLoadEntities: true,
    }),
    ManufacturingInfrastructureModule,
    ManufacturingPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
