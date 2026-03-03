
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

async function trackDeprecations(schemaPath: string) {
  const schema = await loadSchema(schemaPath, { loaders: [new GraphQLFileLoader()] });

  const deprecatedFields: string[] = [];
  const types = schema.getTypeMap();

  for (const typeName in types) {
    const type = types[typeName];
    if ('getFields' in type) {
      const fields = type.getFields();
      for (const fieldName in fields) {
        const field = fields[fieldName];
        if (field.deprecationReason) {
          deprecatedFields.push(`${typeName}.${fieldName}: ${field.deprecationReason}`);
        }
      }
    }
  }

  console.log('Deprecated Fields Report:');
  deprecatedFields.forEach(f => console.log(`- ${f}`));
}
