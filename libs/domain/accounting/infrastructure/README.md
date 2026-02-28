# accounting-infrastructure (Infrastructure Layer)

## 🎯 Purpose
This library provides the **concrete implementations** of the interfaces defined in the Domain and Application layers for the **Accounting** domain. It handles all I/O, database persistence, and external API calls.

## 🏗 Architecture
- **Repositories:** MikroORM/TypeORM implementations of Domain repositories.
- **Adapters:** Implementations of external service ports (e.g., PaymentGateway, EmailService).
- **Configuration:** Database schemas, migrations, and environment variable parsing.

## 🤝 Dependencies
- Depends on **Domain** and **Application** layers (to implement interfaces).
- Depends on external libraries (MikroORM, Redis, etc.).

## 🧪 Testing
- **Integration Tests:** Using Testcontainers (Docker) for real database/service interaction.
- **Contract Tests:** Verifying external API contracts.
