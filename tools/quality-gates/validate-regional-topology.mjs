import fs from 'node:fs';

const mainTfPath = 'platform/infrastructure/terraform/regions/v1/main.tf';
const valuesPath = 'platform/helm/virteex/values.yaml';

const mainTf = fs.readFileSync(mainTfPath, 'utf8');
const values = fs.readFileSync(valuesPath, 'utf8');

const requiredTokens = [
  'sovereignty_mode',
  'data_residency_boundary',
  'compliance_tier',
  'availability_zones',
  'module "regional_stack"',
  'module "compute"',
  'module "data"',
  'module "queues"',
  'module "observability"',
];

const missingTokens = requiredTokens.filter((token) => !mainTf.includes(token));
if (missingTokens.length > 0) {
  console.error(`Missing required regional topology fields in ${mainTfPath}: ${missingTokens.join(', ')}`);
  process.exit(1);
}

const replicaMatches = [...values.matchAll(/\n\s{4}replicas:\s*(\d+)/g)];
if (replicaMatches.length === 0) {
  console.error(`No replicas configured in ${valuesPath}.`);
  process.exit(1);
}

const underReplicated = replicaMatches
  .map((match) => Number(match[1]))
  .filter((replicas) => replicas < 2);

if (underReplicated.length > 0) {
  console.error(`All services must define at least 2 replicas for HA. Found: ${underReplicated.join(', ')}`);
  process.exit(1);
}

if (!values.includes('maxUnavailable')) {
  console.error('PodDisruptionBudget maxUnavailable is required for every service.');
  process.exit(1);
}

console.log('Regional topology and HA deployment policy checks passed.');
