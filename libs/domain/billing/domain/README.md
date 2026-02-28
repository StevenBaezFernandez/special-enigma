# billing-domain (Domain Layer)

## 🎯 Purpose
This library encapsulates the **Pure Business Logic** and **Enterprise Rules** for the **Billing** domain. It is the heart of the system, designed to be framework-agnostic and free of external dependencies.

## 🏗 Architecture
Following **Clean Architecture** and **Domain-Driven Design (DDD)** principles:
- **Entities:** Rich domain models with behavior (not anemic).
- **Value Objects:** Immutable objects defined by their attributes.
- **Domain Services:** Logic that doesn't belong to a single entity.
- **Ports (Interfaces):** Definitions for repositories and external services (implemented in Infrastructure).

## 🚫 Constraints
- **No dependencies** on Infrastructure, Application, or Presentation layers.
- **No frameworks** (e.g., no NestJS decorators, no TypeORM/MikroORM specifics unless using platform-agnostic abstractions).
- **Pure TypeScript/JavaScript** logic.

## 🧪 Testing
- **Unit Tests Only:** High coverage (>80%) required.
- **Property-based Testing:** Encouraged for complex rules.
