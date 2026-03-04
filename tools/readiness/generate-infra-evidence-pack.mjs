import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const tfPath = path.join(root, 'platform/infrastructure/terraform/regions/v1/main.tf');
const outputRoot = path.join(root, 'evidence/infrastructure');

const tfContent = fs.readFileSync(tfPath, 'utf8');
const regionMatches = [...tfContent.matchAll(/\n\s{4}([a-z]{2}-[a-z]+-\d+)\s*=\s*\{/g)];
const regions = [...new Set(regionMatches.map((m) => m[1]))];

if (regions.length === 0) {
  throw new Error('No regional definitions found for evidence generation.');
}

for (const region of regions) {
  const dir = path.join(outputRoot, region);
  fs.mkdirSync(dir, { recursive: true });

  const topologySection = tfContent
    .split('\n')
    .filter((line) => line.includes(region) || line.includes('sovereignty_mode') || line.includes('data_residency_boundary') || line.includes('compliance_tier'))
    .join('\n');

  fs.writeFileSync(path.join(dir, 'topology.tf.snippet.txt'), `${topologySection}\n`);

  const gitHistory = execSync(`git log --date=iso --pretty=format:'%h | %ad | %an | %s' -- platform/infrastructure/terraform/regions/v1 platform/helm/virteex .github/workflows/ci-cd.yml`, {
    encoding: 'utf8',
  });
  fs.writeFileSync(path.join(dir, 'changes.log'), `${gitHistory}\n`);

  let tfState = 'terraform state unavailable';
  try {
    tfState = execSync('terraform -chdir=platform/infrastructure/terraform/regions/v1 show -json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    tfState = 'terraform show -json unavailable in current environment';
  }
  fs.writeFileSync(path.join(dir, 'terraform-state.json'), tfState);

  const manifest = {
    region,
    generatedAt: new Date().toISOString(),
    source: {
      topology: 'platform/infrastructure/terraform/regions/v1/main.tf',
      deployment: 'platform/helm/virteex/templates/all-apps.yaml',
      pipeline: '.github/workflows/ci-cd.yml',
    },
    traceability: 'See changes.log for git commit trace',
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Generated infrastructure evidence packs for regions: ${regions.join(', ')}`);
