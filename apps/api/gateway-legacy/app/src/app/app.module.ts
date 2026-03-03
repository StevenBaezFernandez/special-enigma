import { Module, Logger } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import depthLimit from 'graphql-depth-limit';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { GraphQLError } from 'graphql';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const supergraphSdlPath = configService.get('SUPERGRAPH_SDL_PATH') || join(__dirname, 'assets', 'supergraph.graphql');
        let supergraphSdl: string;
        try {
          supergraphSdl = readFileSync(supergraphSdlPath, 'utf8');
        } catch (e) {
          Logger.error(`Failed to load supergraph SDL from ${supergraphSdlPath}`, 'Gateway');
          supergraphSdl = '';
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
                      const maxComplexity = userTier === 'ENTERPRISE' ? 2000 : (userTier === 'PRO' ? 500 : 100);

                      const complexity = getComplexity({
                        schema,
                        query: source as any,
                        variables: {},
                        estimators: [
                          fieldExtensionsEstimator(),
                          simpleEstimator({ defaultComplexity: 1 }),
                        ],
                      });
                      if (complexity > maxComplexity) {
                        throw new Error(
                          `Query is too complex: ${complexity}. Maximum allowed for ${userTier} tier: ${maxComplexity}`,
                        );
                      }
                    };
                  },
                };
              },
            },
          ],
        };
      },
    }),
  ],
})
export class AppModule {}
