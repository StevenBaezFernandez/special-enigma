# Virteex API Gateway

## 🎯 Purpose
The **Virteex API Gateway** serves as the **Single Entry Point** for all client applications (Web, Mobile, External Integrations). It implements the **BFF (Backend for Frontend)** pattern and orchestrates requests to the underlying microservices via **GraphQL Federation**.

## 🔑 Key Responsibilities
- **Authentication & Authorization:** Validates JWTs, handles session management, and enforces RBAC (Role-Based Access Control).
- **GraphQL Federation:** Aggregates schemas from domain services (`Inventory`, `Billing`, `Identity`) into a unified graph.
- **Rate Limiting:** Protects the system from abuse using Redis-backed rate limiters.
- **Security:** Implements CORS, CSRF protection, and strictly validates the `VIRTEEX_HMAC_SECRET` for inter-service communication.

## 🛠 Configuration
The application requires the following environment variables:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `PORT` | The port the server listens on (default: 3000). | No |
| `JWT_SECRET` | Secret key for signing/verifying JWTs. | **Yes** |
| `VIRTEEX_HMAC_SECRET` | Secret key for signing inter-service requests. | **Yes** |
| `REDIS_URL` | Connection string for Redis (Rate Limiting/Caching). | **Yes** |

## 🚀 Running the Application

### Development
```bash
npx nx serve virteex-api-gateway
```

### Production Build
```bash
npx nx build virteex-api-gateway
node dist/apps/virteex-api-gateway/main.js
```

## 🧪 Health Checks
The gateway exposes a `/health` endpoint for readiness and liveness probes.

## ⚠️ Notes
- Ensure Redis is running before starting the gateway.
- This service does **not** contain business logic; it delegates to domain services.
