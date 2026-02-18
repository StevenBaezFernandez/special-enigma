import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AdminInfrastructureModule } from '@virteex/admin-infrastructure';
import { AdminPresentationModule } from '@virteex/admin-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.ADMIN_DB_HOST,
      port: Number(process.env.ADMIN_DB_PORT),
      user: process.env.ADMIN_DB_USER,
      password: process.env.ADMIN_DB_PASSWORD,
      dbName: process.env.ADMIN_DB_NAME,
      autoLoadEntities: true,
    }),
    AdminInfrastructureModule,
    AdminPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
