# inventory-presentation (Presentation Layer)

## 🎯 Purpose
This library serves as the **Entry Point** for the **Inventory** domain. It handles HTTP requests, GraphQL queries, and event subscriptions, delegating execution to the Application layer.

## 🏗 Architecture
- **Controllers:** REST API endpoints (NestJS).
- **Resolvers:** GraphQL resolvers.
- **Consumers:** Kafka/RabbitMQ event consumers.
- **Module Definition:** The root NestJS module that wires dependencies (IoC).

## 🤝 Dependencies
- Depends on **Application** layer.
- Depends on **Contracts** layer.
- **No business logic** here; only transport-specific validation and delegation.

## 🧪 Testing
- **E2E Tests:** Verifying full request/response cycles.
