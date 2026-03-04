# Regional IaC v1

Versioned regional infrastructure stack with sovereignty parameters per region.

## Domains covered
- `modules/network`: VPC and subnets tagged for sovereignty/compliance boundaries.
- `modules/compute`: EKS cluster baseline for HA workloads.
- `modules/data`: Aurora + ElastiCache with regional data-residency controls.
- `modules/queues`: MSK event backbone per region.
- `modules/observability`: CloudWatch regional log groups and dashboards.

## Required governance parameters per region
- `sovereignty_mode` (`strict|hybrid|global`)
- `data_residency_boundary`
- `compliance_tier`
- `availability_zones` (minimum 2)

## Evidence and validation
- Topology validation: `npm run infra:validate-topology`
- Drift and terraform validation: `npm run infra:check-drift`
- Evidence pack generation: `npm run readiness:infra-evidence`
