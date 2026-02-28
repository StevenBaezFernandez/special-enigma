import { Tree, formatFiles, installPackagesTask } from '@nx/devkit';
import { applicationGenerator } from '@nx/angular/generators';

export default async function (tree: Tree, schema: any) {
  await applicationGenerator(tree, {
    name: \`web-\${schema.name}-app\`,
    directory: \`apps/web/\${schema.name}/app\`,
    tags: \`scope:\${schema.name},layer:app\`,
    style: 'scss',
    routing: true,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
