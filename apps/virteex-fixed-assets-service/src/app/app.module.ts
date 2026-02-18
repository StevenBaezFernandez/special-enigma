import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { FixedAssetsInfrastructureModule } from '@virteex/fixed-assets-infrastructure';
import { FixedAssetsPresentationModule } from '@virteex/fixed-assets-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.FIXED_ASSETS_DB_HOST,
      port: Number(process.env.FIXED_ASSETS_DB_PORT),
      user: process.env.FIXED_ASSETS_DB_USER,
      password: process.env.FIXED_ASSETS_DB_PASSWORD,
      dbName: process.env.FIXED_ASSETS_DB_NAME,
      autoLoadEntities: true,
    }),
    FixedAssetsInfrastructureModule,
    FixedAssetsPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
