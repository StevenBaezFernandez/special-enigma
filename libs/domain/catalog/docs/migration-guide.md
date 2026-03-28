# Migration Guide - Catalog Domain (v2.0)

## Overview
Migration from the previous structure to the canonical v2.0 domain structure.

## Changes
- Renamed `ui-store` to `ui`.
- Reorganized `domain/src/lib` content to match `entities/`, `events/`, `repository-ports/`.
- Restructured `application/src/lib` use cases into bounded contexts.
- Introduced API versioning in `contracts/src/lib/api/v1`.
- Standardized `infrastructure/` and `presentation/` structures.

## Profile Assignment
- Assigned as **service-domain** according to standard guidelines.
