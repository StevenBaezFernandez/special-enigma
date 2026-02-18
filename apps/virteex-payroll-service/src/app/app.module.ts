import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PayrollInfrastructureModule } from '@virteex/payroll-infrastructure';
import { PayrollPresentationModule } from '@virteex/payroll-presentation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env.PAYROLL_DB_HOST,
      port: Number(process.env.PAYROLL_DB_PORT),
      user: process.env.PAYROLL_DB_USER,
      password: process.env.PAYROLL_DB_PASSWORD,
      dbName: process.env.PAYROLL_DB_NAME,
      autoLoadEntities: true,
    }),
    PayrollInfrastructureModule,
    PayrollPresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
