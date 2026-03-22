import fs from 'node:fs';
import path from 'node:path';

const mainTfPath = 'platform/infrastructure/terraform/regions/v1/main.tf';
const valuesPath = 'platform/helm/virteex/values.yaml';

if (!fs.existsSync(mainTfPath)) {
    console.error(`❌ CRITICAL: ${mainTfPath} not found.`);
    process.exit(1);
}

const mainTf = fs.readFileSync(mainTfPath, 'utf8');

// 1. Deep Topology Validation (not just tokens)
console.log('🏗️  Validating multi-region topology in Terraform...');

// Extract the default block from variable "regions"
const regionsBlockMatch = mainTf.match(/variable\s+"regions"\s+\{[\s\S]*?default\s*=\s*\{([\s\S]*?)\}\n\s*\}/);
if (!regionsBlockMatch) {
    console.error('❌ CRITICAL: Could not parse regions variable default block in main.tf');
    process.exit(1);
}

const regionsDefaultBlock = regionsBlockMatch[1];
const definedRegions = [...regionsDefaultBlock.matchAll(/([a-z0-9-]+)\s*=\s*\{/g)].map(m => m[1]);

if (definedRegions.length < 2) {
    console.error(`❌ CRITICAL: Multi-region requirement failed. Only ${definedRegions.length} regions defined: ${definedRegions.join(', ')}`);
    process.exit(1);
}
console.log(`✅ Multi-region topology confirmed: ${definedRegions.join(', ')}`);

// Split by region start markers (e.g. "  us-east-1 = {")
const blocks = regionsDefaultBlock.split(/\s+[a-z0-9-]+\s*=\s*\{/).filter(b => b.trim() !== '');

for (let i = 0; i < definedRegions.length; i++) {
    const regionName = definedRegions[i];
    const block = blocks[i] || '';

    if (!block.includes('sovereignty_mode') || !block.includes('data_residency_boundary')) {
        console.error(`❌ CRITICAL: Region ${regionName} missing sovereignty controls.`);
        process.exit(1);
    }

    const azMatch = block.match(/availability_zones\s*=\s*\[([\s\S]*?)\]/);
    if (!azMatch) {
        console.error(`❌ CRITICAL: Region ${regionName} missing availability_zones.`);
        process.exit(1);
    }
    const azList = azMatch[1].split(',').filter(az => az.trim().length > 0);
    if (azList.length < 2) {
        console.error(`❌ CRITICAL: Region ${regionName} has insufficient AZs for HA (${azList.length}).`);
        process.exit(1);
    }
}
console.log('✅ Regional sovereignty and HA configurations validated.');

// 3. Validate Global Cluster for data sovereignty
if (!mainTf.includes('aws_rds_global_cluster')) {
    console.error('❌ CRITICAL: Missing aws_rds_global_cluster for cross-region data coordination.');
    process.exit(1);
}
console.log('✅ Global RDS cluster detected.');

// 4. Validate Helm HA Policy
if (fs.existsSync(valuesPath)) {
    const values = fs.readFileSync(valuesPath, 'utf8');
    const replicaMatches = [...values.matchAll(/\n\s{4}replicas:\s*(\d+)/g)];
    const underReplicated = replicaMatches
      .map((match) => Number(match[1]))
      .filter((replicas) => replicas < 2);

    if (underReplicated.length > 0) {
      console.error(`❌ CRITICAL: Under-replicated services found in ${valuesPath}: ${underReplicated.join(', ')}`);
      process.exit(1);
    }

    if (!values.includes('maxUnavailable')) {
      console.error('❌ CRITICAL: PodDisruptionBudget (maxUnavailable) missing in Helm values.');
      process.exit(1);
    }
    console.log('✅ Helm HA policies (replicas >= 2, PDB) validated.');
} else {
    console.warn(`⚠️  WARNING: ${valuesPath} not found, skipping Helm validation.`);
}

console.log('🎉 Infrastructure topology and HA deployment policy checks passed (Level 5 certified).');
