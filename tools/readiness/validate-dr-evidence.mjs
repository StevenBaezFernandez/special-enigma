#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHmac } from 'node:crypto';

const releaseTier = process.env.RELEASE_TIER || 'standard';
if (releaseTier !== 'enterprise') {
  console.log('Skipping DR evidence gate: RELEASE_TIER is not enterprise.');
  process.exit(0);
}

const evidenceDir = path.resolve(process.env.DR_EVIDENCE_DIR || 'evidence/drills');
const maxAgeDays = Number(process.env.DR_EVIDENCE_MAX_AGE_DAYS || 30);
const now = Date.now();

if (!fs.existsSync(evidenceDir)) {
  console.error(`Missing evidence directory: ${evidenceDir}`);
  process.exit(1);
}

const files = fs.readdirSync(evidenceDir).filter((file) => file.endsWith('.json'));
if (files.length === 0) {
  console.error('No DR evidence files found.');
  process.exit(1);
}

const candidates = files
  .map((file) => {
    const fullPath = path.join(evidenceDir, file);
    const payload = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return { file, fullPath, payload };
  })
  .filter(({ payload }) => payload.status === 'SUCCESS')
  .sort((a, b) => new Date(b.payload.executedAt).getTime() - new Date(a.payload.executedAt).getTime());

if (candidates.length === 0) {
  console.error('No successful DR evidence found.');
  process.exit(1);
}

const latest = candidates[0];
const ageMs = now - new Date(latest.payload.executedAt).getTime();
const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
if (ageMs > maxAgeMs) {
  console.error(`Latest DR evidence is stale (${Math.round(ageMs / (24 * 60 * 60 * 1000))} days old).`);
  process.exit(1);
}

const requiredFields = [
  latest.payload.inputs,
  latest.payload.timeline,
  latest.payload.telemetry,
  latest.payload.rollback,
  latest.payload.postmortem,
  latest.payload.validation,
];
if (requiredFields.some((value) => value === undefined)) {
  console.error('Latest DR evidence is missing mandatory sections (inputs/timeline/telemetry/rollback/postmortem/validation).');
  process.exit(1);
}

if (!latest.payload.validation.integrityPostPromotion) {
  console.error('Latest DR evidence failed integrity post-promotion validation.');
  process.exit(1);
}

if (typeof latest.payload.telemetry.backlogBefore !== 'number' || typeof latest.payload.telemetry.backlogAfter !== 'number') {
  console.error('Latest DR evidence does not contain backlog telemetry.');
  process.exit(1);
}

if (!latest.payload.signature) {
  console.error('Latest DR evidence is not signed.');
  process.exit(1);
}

const secret = process.env.EVIDENCE_SIGNING_SECRET;
if (secret) {
  const unsignedPayload = { ...latest.payload };
  const signature = unsignedPayload.signature;
  delete unsignedPayload.signature;
  const computed = createHmac('sha256', secret).update(JSON.stringify(unsignedPayload)).digest('hex');
  if (computed !== signature) {
    console.error('Latest DR evidence signature verification failed.');
    process.exit(1);
  }
}

console.log(`✅ DR evidence gate passed with ${latest.file}`);
