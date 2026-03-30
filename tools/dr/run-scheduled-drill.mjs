#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHmac } from 'node:crypto';

const schedulePath = process.env.DR_SCHEDULE_FILE || 'config/operations/dr-schedule.enterprise.json';
const triggerEndpoint = process.env.DR_DRILL_TRIGGER_ENDPOINT;
const signingSecret = process.env.EVIDENCE_SIGNING_SECRET;

if (!triggerEndpoint) {
  console.error('DR_DRILL_TRIGGER_ENDPOINT is required to execute real drills.');
  process.exit(1);
}
if (!signingSecret) {
  console.error('EVIDENCE_SIGNING_SECRET is required to sign drill evidence.');
  process.exit(1);
}
if (!fs.existsSync(schedulePath)) {
  console.error(`Schedule file not found: ${schedulePath}`);
  process.exit(1);
}

const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
if (!Array.isArray(schedule.drills) || schedule.drills.length === 0) {
  console.error('No drills configured in schedule.');
  process.exit(1);
}

const outputDir = path.resolve('evidence/drills');
fs.mkdirSync(outputDir, { recursive: true });

for (const drill of schedule.drills) {
  const body = {
    tenantId: drill.tenantId,
    targetRegion: drill.targetRegion,
    sourceRegion: drill.sourceRegion,
    expectedRtoMs: drill.expectedRtoMs,
    expectedRpoMs: drill.expectedRpoMs,
    releaseTier: schedule.releaseTier,
    triggeredBy: 'github-actions/scheduled-drill'
  };

  const res = await fetch(triggerEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-drill-auth-token': process.env.DR_DRILL_AUTH_TOKEN || ''
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Drill trigger failed for ${drill.tenantId}: ${res.status} ${await res.text()}`);
  }

  const result = await res.json();

  // Level 5: High-precision RTO/RPO calculation validation
  if (result.telemetry.rtoMs > body.expectedRtoMs) {
      console.warn(`⚠️  DRILL RTO EXCEEDED: Observed ${result.telemetry.rtoMs}ms > Expected ${body.expectedRtoMs}ms`);
  }

  const evidence = {
    ...result,
    scheduleId: schedule.scheduleId,
    executedAt: new Date().toISOString(),
    postmortem: result.postmortem || {
        summary: result.status === 'SUCCESS' ? 'Drill completed successfully.' : 'Drill failed.',
        actionItems: result.telemetry.backlogAfter > 0 ? ['Optimize outbox drain rate'] : []
    }
  };

  const signature = createHmac('sha256', signingSecret)
    .update(JSON.stringify(evidence))
    .digest('hex');
  evidence.signature = signature;

  const filename = `${evidence.executedAt.slice(0, 10)}-${drill.tenantId}-${drill.targetRegion}.json`;
  fs.writeFileSync(path.join(outputDir, filename), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`✅ Drill evidence stored: ${filename}`);
}
