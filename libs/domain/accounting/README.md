# Accounting Domain

## 🎯 Purpose
The Accounting domain is responsible for managing the financial records of the organization, including the chart of accounts, journal entries, fiscal years, and financial reporting. It ensures compliance with fiscal regulations and provides a single source of truth for financial data.

## 📈 Profile: core-domain
This is a **core-domain** containing critical business rules and exposing synchronous APIs for financial operations.

## 🏗 Architecture
Following **Clean Architecture** and **Domain-Driven Design (DDD)** principles:
- **Domain:** Pure business logic and entities.
- **Application:** Use cases and orchestration.
- **Contracts:** Versioned DTOs and events.
- **Infrastructure:** Concrete implementations (persistence, messaging).
- **Presentation:** Entry points (HTTP, GraphQL).
- **UI:** Domain-specific frontend components.

## 👥 Owners
- **Team:** Finance & Core Services
- **Main Contact:** @accounting-team

## 🔗 Links
- [Migration Guide](./docs/migration-guide.md)
- [Architecture ADRs](./docs/adr/)

## 📊 Quality & Coverage
| Layer          | Target Coverage | Actual Coverage | Criticality |
| -------------- | --------------- | --------------- | ----------- |
| Layer          | Target Coverage | Actual Coverage | Criticality |
| -------------- | --------------- | --------------- | ----------- |
| domain         | 100%            | >95%            | High        |
| application    | 90%             | >90%            | High        |
| contracts      | 100%            | 100%            | Medium      |
| infrastructure | 80%             | >80%            | Medium      |
| presentation   | 80%             | >80%            | Medium      |
| ui             | 70%             | [In Progress]   | Low         |
