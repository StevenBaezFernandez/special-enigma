import fs from 'node:fs';
import path from 'node:path';

const mainTfV1Path = 'platform/infrastructure/terraform/regions/v1/main.tf';
const mainTfRootPath = 'platform/infrastructure/terraform/main.tf';
const valuesPath = 'platform/helm/virteex/values.yaml';

function validateFile(tfPath, label) {
    if (!fs.existsSync(tfPath)) {
        console.error(`❌ CRITICAL: ${label} (${tfPath}) not found.`);
        process.exit(1);
    }

    const mainTf = fs.readFileSync(tfPath, 'utf8');

    // 1. Deep Topology Validation (not just tokens)
    console.log(`🏗️  Validating multi-region topology in ${label}...`);

    // Extract the default block from variable "regions"
    const regionsBlockMatch = mainTf.match(/variable\s+"regions"\s+\{[\s\S]*?default\s*=\s*\{([\s\S]*?)\}\n\s*\}/);
    if (!regionsBlockMatch) {
        console.error(`❌ CRITICAL: Could not parse regions variable default block in ${label}`);
        process.exit(1);
    }

    const regionsDefaultBlock = regionsBlockMatch[1];
    const definedRegions = [...regionsDefaultBlock.matchAll(/([a-z0-9-]+)\s*=\s*\{/g)].map(m => m[1]);

    if (definedRegions.length < 2) {
        console.error(`❌ CRITICAL: Multi-region requirement failed in ${label}. Only ${definedRegions.length} regions defined: ${definedRegions.join(', ')}`);
        process.exit(1);
    }
    console.log(`✅ Multi-region topology confirmed in ${label}: ${definedRegions.join(', ')}`);

    // Split by region start markers (e.g. "  us-east-1 = {")
    const blocks = regionsDefaultBlock.split(/\s+[a-z0-9-]+\s*=\s*\{/).filter(b => b.trim() !== '');

    for (let i = 0; i < definedRegions.length; i++) {
        const regionName = definedRegions[i];
        const block = blocks[i] || '';

        if (!block.includes('sovereignty_mode') || !block.includes('data_residency_boundary')) {
            console.error(`❌ CRITICAL: Region ${regionName} in ${label} missing sovereignty controls.`);
            process.exit(1);
        }

        const azMatch = block.match(/availability_zones\s*=\s*\[([\s\S]*?)\]/);
        if (!azMatch) {
            console.error(`❌ CRITICAL: Region ${regionName} in ${label} missing availability_zones.`);
            process.exit(1);
        }
        const azList = azMatch[1].split(',').filter(az => az.trim().length > 0);
        if (azList.length < 2) {
            console.error(`❌ CRITICAL: Region ${regionName} in ${label} has insufficient AZs for HA (${azList.length}).`);
            process.exit(1);
        }
    }
    console.log(`✅ Regional sovereignty and HA configurations validated in ${label}.`);

    // 3. Validate Global Cluster for data sovereignty
    if (!mainTf.includes('aws_rds_global_cluster')) {
        console.error(`❌ CRITICAL: Missing aws_rds_global_cluster in ${label} for cross-region data coordination.`);
        process.exit(1);
    }
    console.log(`✅ Global RDS cluster detected in ${label}.`);

    return definedRegions;
}

const regionsV1 = validateFile(mainTfV1Path, 'Terraform V1');
const regionsRoot = validateFile(mainTfRootPath, 'Terraform Root');

// Check for consistency
for (const r of regionsV1) {
    if (!regionsRoot.includes(r)) {
        console.error(`❌ CRITICAL: Region ${r} present in V1 but missing in Root IaC.`);
        process.exit(1);
    }
}
console.log('✅ IaC consistency between V1 and Root established.');

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
