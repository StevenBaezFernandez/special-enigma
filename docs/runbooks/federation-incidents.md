# Federation Incident Runbook

## 1. Federation Composition Failure
- **Symptom**: Gateway fails to start with "Supergraph SDL not found" or "Composition error".
- **Action**:
  1. Check CI logs for the `schema-diff` and `validate-federation-contracts` steps.
  2. Verify that all subgraphs are reporting their SDL correctly.
  3. Ensure that the `SUPERGRAPH_SDL_PATH` environment variable is correct.
- **Rollback**: Promote the previous known-good `supergraph.graphql` artifact.

## 2. Latency Degradation (p99 spikes)
- **Symptom**: p99 latency > 120ms.
- **Action**:
  1. Inspect OpenTelemetry traces for `subgraphHopCount` and `subgraphFetch` duration.
  2. Identify the slow subgraph using the `service.name` tag.
  3. Check if the query complexity exceeds the budget for the affected tenant.
- **Mitigation**: Enable/Disable Persisted Queries or adjust Circuit Breaker thresholds.

## 3. Breaking Change Detected
- **Symptom**: Pipeline blocked by `schema-diff` tool.
- **Action**:
  1. Verify if the change is truly breaking using the `schema-diff` report.
  2. If a waiver is required, follow the Architecture Review protocol.
  3. Implement `@deprecated` for the field and plan a migration window.
