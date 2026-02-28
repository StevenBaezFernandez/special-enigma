# accounting-application (Application Layer)

## 🎯 Purpose
This library implements the **Use Cases** and orchestrates the flow of data for the **Accounting** domain. It acts as the glue between the Presentation layer and the Domain layer.

## 🏗 Architecture
- **Use Cases (Interactors):** Specific business actions (e.g., `CreateOrder`, `ProcessPayment`).
- **DTOs (Data Transfer Objects):** Input/Output structures for use cases.
- **Ports (Interfaces):** Secondary ports for Infrastructure implementations.

## 🤝 Dependencies
- Depends on **Domain** layer.
- Depends on **Contracts** (Shared Kernel).
- **No direct dependency** on Infrastructure (Dependency Inversion Principle).

## 🧪 Testing
- **Unit Tests:** Mocking domain services and repositories.
- **Integration Tests:** Verifying use case flows.
