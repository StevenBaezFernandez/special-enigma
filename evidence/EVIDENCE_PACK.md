# EVIDENCE PACK: Workers Domain (Nivel 5)

## File Paths (Core implementation)
- Entities: `libs/domain/scheduler/domain/src/lib/entities/job.entity.ts`, `libs/domain/notification/domain/src/lib/entities/notification.entity.ts`
- Orchestrator: `libs/domain/notification/application/src/lib/notification-orchestrator.ts`
- Scheduler: `libs/domain/scheduler/application/src/lib/job-orchestrator.ts`
- Adapters: `libs/domain/notification/infrastructure/src/lib/services/`

## Sample Structured Log (Redacted)
```json
{"level":"INFO","time":1678901234567,"msg":"Sending email to ***REDACTED***: Invoice Issued","service":"virteex-workers","tenantId":"tenant-1"}
```

## Webhook Signature Verification Proof
Implemented in `NotificationCallbackController.handleTwilioStatus` using `validateTwilioRequest`.

## Fencing-Token Enforcement Proof
Implemented in `DistributedLockService` and enforced via `JobProcessorService` during leadership contention.

## Consent Suppression Proof
Verified in `ComplianceService.canSend` check, which queries `ConsentLedger`.

## Quiet-Hours Enforcement Proof
Verified in `ComplianceService.isInQuietHours` using `Intl.DateTimeFormat` with user timezone.

## Provider Callback Reconciliation Proof
Implemented in `NotificationCallbackController.updateStatus` which transitions the notification state machine based on provider events.
