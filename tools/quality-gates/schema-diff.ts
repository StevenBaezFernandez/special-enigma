
import { diff, ChangeType, CriticalityLevel } from '@graphql-inspector/core';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

async function compareSchemas(oldSchemaPath: string, newSchemaPath: string) {
  const oldSchema = await loadSchema(oldSchemaPath, { loaders: [new GraphQLFileLoader()] });
  const newSchema = await loadSchema(newSchemaPath, { loaders: [new GraphQLFileLoader()] });

  const changes = await diff(oldSchema, newSchema);

  const breakingChanges = changes.filter(c => c.criticality.level === CriticalityLevel.Breaking);

  if (breakingChanges.length > 0) {
    console.error('Breaking changes detected:');
    breakingChanges.forEach(c => console.error(`- [${c.type}] ${c.message}`));
    process.exit(1);
  }

  console.log('No breaking changes detected.');
}
