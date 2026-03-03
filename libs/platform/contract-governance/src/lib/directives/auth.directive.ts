import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

/**
 * Enforces authorization policies defined via @auth directives.
 */
export function authDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (authDirective) {
        const { role } = authDirective;
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const user = context.user;

          if (!user) {
            throw new Error('UNAUTHENTICATED');
          }

          if (role && !user.roles?.includes(role)) {
            throw new Error(`FORBIDDEN: Required role '${role}' not found.`);
          }

          return resolve(source, args, context, info);
        };
        return fieldConfig;
      }
    },
  });
}

/**
 * Marks fields as sensitive to ensure they are handled with elevated care.
 */
export function sensitiveDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const sensitiveDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (sensitiveDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          // Metadata indicating sensitive data is returned, useful for downstream masking
          context.hasSensitiveData = true;
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
