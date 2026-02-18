# Virteex Auth Server

## Identity Provider (IdP)

This application serves as the dedicated Identity Provider for the Virteex ecosystem.

### Purpose

- **Authentication**: Handles user login, OAuth2/OIDC flows.
- **Security**: Centralizes SSO (Single Sign-On), MFA (Multi-Factor Authentication), and security audit logs.
- **Decoupling**: Decouples security concerns from business logic in the API Gateway.

### Key Features

- OAuth2 / OpenID Connect provider.
- Token management (access, refresh).
- User session management.
