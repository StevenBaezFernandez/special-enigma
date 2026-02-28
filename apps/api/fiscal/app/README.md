# Virteex Fiscal Connector

## Fiscal Authority Microservice

This application serves as a gateway to external fiscal authorities (SAT, DIAN, IRS, etc.).

### Purpose

- **Isolation**: Isolates potential connectivity issues and downtime of fiscal authorities from the main ERP system.
- **Reliability**: Provides a dedicated service for handling fiscal transactions that may be slow or synchronous.
- **Security**: Manages digital certificates (CSD, FIEL) and signing processes securely.

### Key Features

- Standardized interface for multiple country fiscal integrations.
- Retries and fallback mechanisms for external API calls.
- Certificate validation and management.
