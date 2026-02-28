import { Tree, formatFiles, installPackagesTask } from '@nx/devkit';
import { libraryGenerator } from '@nx/nest';

export default async function (tree: Tree, schema: any) {
  const layers = ['domain', 'application', 'infrastructure', 'presentation', 'contracts'];
  for (const layer of layers) {
    await libraryGenerator(tree, {
      name: \`domain-\${schema.name}-\${layer}\`,
      directory: \`libs/domain/\${schema.name}/\${layer}\`,
      tags: \`scope:\${schema.name},layer:\${layer}\`,
    });
  }
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
