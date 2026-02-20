import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose } from '@apollo/gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'catalog',
                url: configService.get('CATALOG_SERVICE_URL') || 'http://virteex-catalog-service:3000/graphql',
              },
              {
                name: 'identity',
                url: configService.get('IDENTITY_SERVICE_URL') || 'http://virteex-identity-service:3000/graphql',
              },
              {
                name: 'inventory',
                url: configService.get('INVENTORY_SERVICE_URL') || 'http://virteex-inventory-service:3000/graphql',
              },
              {
                name: 'billing',
                url: configService.get('BILLING_SERVICE_URL') || 'http://virteex-billing-service:3000/graphql',
              },
              {
                name: 'accounting',
                url: configService.get('ACCOUNTING_SERVICE_URL') || 'http://virteex-accounting-service:3000/graphql',
              },
              {
                name: 'payroll',
                url: configService.get('PAYROLL_SERVICE_URL') || 'http://virteex-payroll-service:3000/graphql',
              },
              {
                name: 'treasury',
                url: configService.get('TREASURY_SERVICE_URL') || 'http://virteex-treasury-service:3000/graphql',
              },
              {
                name: 'crm',
                url: configService.get('CRM_SERVICE_URL') || 'http://virteex-crm-service:3000/graphql',
              },
              {
                name: 'projects',
                url: configService.get('PROJECTS_SERVICE_URL') || 'http://virteex-projects-service:3000/graphql',
              },
              {
                name: 'manufacturing',
                url: configService.get('MANUFACTURING_SERVICE_URL') || 'http://virteex-manufacturing-service:3000/graphql',
              },
              {
                name: 'purchasing',
                url: configService.get('PURCHASING_SERVICE_URL') || 'http://virteex-purchasing-service:3000/graphql',
              },
              {
                name: 'bi',
                url: configService.get('BI_SERVICE_URL') || 'http://virteex-bi-service:3000/graphql',
              },
              {
                name: 'admin',
                url: configService.get('ADMIN_SERVICE_URL') || 'http://virteex-admin-service:3000/graphql',
              },
              {
                name: 'fixed-assets',
                url: configService.get('FIXED_ASSETS_SERVICE_URL') || 'http://virteex-fixed-assets-service:3000/graphql',
              },
            ],
          }),
        },
      }),
    }),
  ],
})
export class AppModule {}
