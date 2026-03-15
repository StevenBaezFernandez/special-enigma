import { Module, Logger, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createVerify } from 'crypto';
import depthLimit from 'graphql-depth-limit';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { createTenantAwareComplexityEstimator, complexityBudgets } from '@virteex/platform-contract-governance';
import { GraphQLError } from 'graphql';
import { TenantModule } from '@virteex/kernel-tenant';
import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    TenantModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const supergraphSdlPath = configService.get('SUPERGRAPH_SDL_PATH') || join(__dirname, 'assets', 'supergraph.graphql');
        const manifestPath = configService.get('SUPERGRAPH_MANIFEST_PATH') || `${supergraphSdlPath}.manifest.json`;
        const publicKeyPath = configService.get('GATEWAY_PUBLIC_KEY_PATH') || join(__dirname, 'assets', 'gateway-public.pem');

        if (!existsSync(supergraphSdlPath)) {
          Logger.error(`CRITICAL: Supergraph SDL missing at ${supergraphSdlPath}. Gateway aborting.`, 'Gateway');
          process.exit(1);
        }

        if (!existsSync(manifestPath)) {
          Logger.error(`CRITICAL: Supergraph manifest missing at ${manifestPath}. Gateway aborting.`, 'Gateway');
          process.exit(1);
        }

        const supergraphSdl = readFileSync(supergraphSdlPath, 'utf8');
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

        // Signature Verification
        if (process.env.NODE_ENV === 'production' || configService.get('ENFORCE_SIGNATURE') === 'true') {
          if (!existsSync(publicKeyPath)) {
            Logger.error(`CRITICAL: Public key missing at ${publicKeyPath}. Gateway aborting.`, 'Gateway');
            process.exit(1);
          }
          const publicKey = readFileSync(publicKeyPath, 'utf8');
          const verify = createVerify('SHA256');
          verify.update(supergraphSdl);
          verify.end();
          if (!verify.verify(publicKey, manifest.signature, 'hex')) {
            Logger.error('CRITICAL: Supergraph signature verification failed. Gateway aborting.', 'Gateway');
            process.exit(1);
          }
          Logger.log('Supergraph signature verified successfully.', 'Gateway');
        }

        return {
          gateway: {
            supergraphSdl,
            buildService({ url }) {
              const { RemoteGraphQLDataSource } = require('@apollo/gateway');
              return new RemoteGraphQLDataSource({
                url,
                willSendRequest({ request, context }) {
                  if (context.req?.headers) {
                    Object.entries(context.req.headers).forEach(([k, v]) => {
                       request.http?.headers.set(k, v as string);
                    });
                  }
                },
              });
            },
          },
          // SECURITY: Surface hardening
          validationRules: [
            depthLimit(10),
            // Max variables and query size can be enforced via custom rules or Apollo Server options
          ],
          csrfPrevention: true,
          cache: 'bounded',
          stopOnTerminationSignals: true,
          introspection: process.env['NODE_ENV'] !== 'production',

          context: ({ req }) => ({
            req,
            user: (req as any).user,
          }),
          formatError: (error: GraphQLError) => {
            const graphQLFormattedError = {
              message: error.message,
              code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
              path: error.path,
              requestId: (error.extensions?.requestId as string) || (error.extensions?.req as any)?.headers?.['x-request-id'],
            };

            if (process.env['NODE_ENV'] === 'production') {
              delete (graphQLFormattedError as any).extensions?.exception;
            }

            return graphQLFormattedError;
          },
          persistedQueries: {
             cache: undefined,
          },
          plugins: [
            {
              async requestDidStart() {
                return {
                  async validationDidStart({ source, schema, context }) {
                    return async (errors) => {
                      if (errors.length > 0) return;

                      const userTier = (context as any).user?.tier || 'BASIC';
                      const maxComplexity = (complexityBudgets as any)[userTier] || complexityBudgets.BASIC;

                      const complexity = getComplexity({
                        schema,
                        query: source as any,
                        variables: {},
                        estimators: [
                          createTenantAwareComplexityEstimator(),
                          fieldExtensionsEstimator(),
                          simpleEstimator({ defaultComplexity: 1 }),
                        ],
                      });
                      if (complexity > maxComplexity) {
                        throw new Error(
                          `Query is too complex: ${complexity}. Maximum allowed for ${userTier} tier: ${maxComplexity}`,
                        );
                      }
                      (context as any).queryComplexity = complexity;
                    };
                  },
                  async willSendResponse({ response, context }) {
                    // Inject metrics into response extensions for observability (non-production only or secure headers)
                    if (process.env.NODE_ENV !== 'production') {
                      response.http.headers.set('X-Query-Complexity', String((context as any).queryComplexity || 0));
                    }
                  }
                };
              },
            },
          ],
        };
      },
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CanonicalTenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
