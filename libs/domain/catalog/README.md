# Catalog Domain

## 🎯 Purpose
This domain manages the product catalog, including product definitions, SAT catalogs, and related metadata.

## 👤 Profile
**Profile:** `service-domain`
**Description:** Orchestration, workers, and integrations for catalog-related data.

## 👥 Owners
- **Team:** Virteex Core Team
- **Slack:** #team-catalog

## 🏗 Architecture
This domain follows the **Clean Architecture** and **Domain-Driven Design (DDD)** principles as defined in the [Virteex Architecture Guide](../../../docs/architecture/GUIA_MIGRACION_DOMINIOS_V2.md).

### Layers:
- **Domain:** Pure business logic and entities.
- **Application:** Use cases and orchestration.
- **Contracts:** Versioned DTOs and integration messages.
- **Infrastructure:** Adapters for persistence, messaging, and external services.
- **Presentation:** Entry points (HTTP controllers, GraphQL resolvers).
- **UI:** Domain-specific frontend components.

## 🧪 Testing
Run tests for each layer using Nx:
```bash
nx test domain-catalog-<layer>
```
