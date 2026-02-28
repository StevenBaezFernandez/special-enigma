import { Tree, formatFiles, installPackagesTask } from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';

export default async function (tree: Tree, schema: any) {
  await applicationGenerator(tree, {
    name: \`api-\${schema.name}-app\`,
    directory: \`apps/api/\${schema.name}/app\`,
    tags: \`scope:\${schema.name},layer:app\`,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
