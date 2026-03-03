# Runbook: Workers Domain (Scheduler/Notification)

## Overview
The Workers domain manages distributed job execution and multi-channel notifications with enterprise-grade guarantees (idempotency, consistency, compliance).

## Components
- **JobOrchestrator**: Manages BullMQ queues.
- **JobProcessorService**: Executes background tasks with Inbox idempotency.
- **NotificationOrchestrator**: Handles channel routing, templates, and compliance.
- **NotificationCallbackController**: Reconciles external status updates.

## Critical Operations

### Recovering from Dead Letter Queues (DLQ)
1. Identify failed jobs in the `dead_letter_jobs` table or via BullMQ dashboard.
2. Verify the root cause in `job_attempts`.
3. Use the `replay` function to move jobs back to `PENDING` state.
4. Monitor the `JobHistory` for success.

### Handling Leadership Failover
If the primary scheduler node fails:
1. The `DistributedLockService` will expire.
2. A new node will acquire the lock and generate a new `fencingToken`.
3. Workers will only execute jobs matching the latest `fencingToken`.

## Troubleshooting

### High Latency in Notifications
1. Check `accepted_to_sent_latency` metrics.
2. Verify provider-side rate limits (Twilio/Firebase).
3. Check for lock contention in Redis.

### Webhook Signature Failures
1. Verify `TWILIO_AUTH_TOKEN` is set correctly in environment variables.
2. Check if the load balancer is correctly forwarding the `X-Twilio-Signature` header.
