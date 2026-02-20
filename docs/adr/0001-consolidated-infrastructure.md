# 1. Consolidate Infrastructure in Platform Directory

Date: 2025-05-15

## Status

Accepted

## Context

The repository previously had a fragmented infrastructure structure with root-level directories for `infrastructure/`, `k8s/`, and `helm/`. This created:
- Conceptual duplication (where is the source of truth for k8s?).
- Inconsistency in tooling usage.
- "Root sprawl" in the repository.

This was identified as a weakness in the architectural audit, preventing the project from reaching "enterprise-grade" status (10/10).

## Decision

We have decided to consolidate all infrastructure and platform-engineering related code into a single top-level `platform/` directory.

The new structure is:

- `platform/kubernetes/`: Contains all Kubernetes manifests and templates.
  - `manifests/`: Raw manifests (formerly `infrastructure/k8s`).
  - `templates/`: Templates (formerly root `k8s`).
- `platform/helm/`: Contains Helm charts (formerly root `helm`).
- `platform/infrastructure/`: Contains Terraform and Docker configurations.
  - `terraform/`: formerly `infrastructure/terraform`.
  - `docker/`: formerly `infrastructure/docker`.
- `platform/observability/`: Contains monitoring configurations (e.g., Prometheus).

## Consequences

### Positive
- **Single Source of Truth:** All infra code is in `platform/`.
- **Cleaner Root:** The root directory is focused on `apps`, `libs`, and `platform`.
- **Better Ownership:** The `platform/` directory can be easily assigned to a Platform Team via CODEOWNERS.

### Negative
- **Path Updates:** CI/CD pipelines (like `skaffold.yaml`) needed updates to point to new paths.
- **Muscle Memory:** Developers used to `infrastructure/` will need to adjust.

## Compliance

This change aligns with modern Platform Engineering practices and Monorepo governance standards.
