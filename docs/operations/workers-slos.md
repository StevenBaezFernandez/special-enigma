# SLOs: Workers Domain

## Service Level Objectives (SLOs)

### Scheduler
- **Job Execution Success Rate**: >= 99.95% for critical workloads (Fiscal, Billing).
- **Processing Latency (p95)**: < 5s from Enqueue to Start.
- **Deduplication Effective Rate**: <= 0.001% of duplicate business effects.

### Notification
- **Delivery Success Rate**: >= 99.9% for transactional emails.
- **Accepted to Provider Send Latency (p95)**: < 2s.
- **Callback Processing Latency (p95)**: < 5s.
- **Compliance Suppression Rate**: Must be 100% for opt-out/quiet-hours.

## Alerting thresholds
- **Critical Failure Rate**: Trigger on-call if Job Failure Rate > 0.5% over 5 minutes.
- **Backlog Overflow**: Trigger if `queue_depth` > 10,000 for any tenant.
- **Provider Circuit Breaker**: Trigger if provider error rate > 5% over 1 minute.
