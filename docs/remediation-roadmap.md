# Remediation Roadmap - Virteex ERP

## 1. Backlog Priorizado

### Prioridad P0: Bloqueantes Comerciales (REMEDIADO/ENDURECIDO)
- **Seguridad**:
  - [DONE] SBOM y firma obligatorios en CI/CD (sin fallback).
  - [DONE] Eliminación de bypasses en E2E crítica.
  - [DONE] Endurecimiento de TLS (rejectUnauthorized: fail-closed).
  - [DONE] Sellado de simulaciones (MockFiscalProvider, NullPac) en prod.
- **Infraestructura**:
  - [DONE] Alta disponibilidad (replicas: 2) en servicios base.
  - [DONE] RDS Snapshots obligatorios.
- **Fiscal CO**: XAdES-EPES base implementado, integración sincrónica DIAN, notas crédito/débito.
- **Fiscal BR**: mTLS real, soporte A1/A3, bridge de escritorio.
- **Fiscal US**: Adapter productivo, exemptions por estado.
- **Accounting**: Balance General, P&L, cierre fiscal, multi-moneda básica.

### Prioridad P1: Endurecimiento Operativo
- **Tenancy**: Orquestador `database-per-tenant`.
- **Observabilidad**: Monitor de latencia RLS.
- **Accounting**: Conciliación bancaria inicial.
- **Fixed Assets**: Depreciación automática y posting.

### Prioridad P2: Expansión Industrial
- **Manufacturing**: MRP I/II, centros de trabajo, reservas de componentes.
- **Fixed Assets**: Mantenimiento.

## 2. Estrategia de Rollout
1. **Fase de Desarrollo**: Implementación de P0 en branches de feature.
2. **Fase de Certificación**: Validación con simuladores de autoridades y Testcontainers.
3. **Fase de Canary**: Despliegue de adaptadores productivos bajo Feature Flags.

## 3. Criterios de Aceptación por Item
- **Fiscalidad**: 100% de tests de integración pasando con fixtures reales.
- **Seguridad**: SBOM generado y validado en cada build de CI.
- **Accounting**: Reportes financieros coinciden con saldos del ledger.

## 4. Plan de Backward Compatibility
- Mantener soporte para adaptadores Mock mediante configuración para entornos de desarrollo.
- Versionamiento semántico en contratos de `shared-dto`.
