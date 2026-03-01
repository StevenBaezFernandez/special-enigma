# Virteex ERP Monorepo

Repositorio Nx para servicios backend, frontend y runtimes de plugins de Virteex ERP.

## Arquitectura

Este monorepo sigue los principios de **Clean Architecture** y **Domain-Driven Design (DDD)**. Los límites arquitectónicos se imponen automáticamente a través de gobernanza por código.

Para una visión detallada de la estructura, consulta el [Monorepo Map](docs/MONOREPO_MAP.md).

### Reglas Críticas de Arquitectura

1.  **Pureza del Dominio**: La capa `domain` es puro TypeScript. No debe importar frameworks como NestJS o MikroORM.
2.  **Desacoplamiento de Aplicación**: Los casos de uso en `application` no deben depender de excepciones HTTP ni de detalles de la capa de transporte.
3.  **Composición Roots**: Las aplicaciones en `apps/*` deben ser delgadas y actuar principalmente como raíces de composición para orquestar las librerías.

## Gobernanza y Calidad

El repositorio incluye herramientas automáticas para asegurar la salud de la arquitectura:

- `npm run arch:check`: Valida los límites entre capas y dominios (se ejecuta en pre-commit).
- `npm run governance:check`: Ejecuta el baseline de gobernanza ejecutable (consistencia scripts/docs/workflows, tags, naming, backend test targets, cobertura e2e).
- `npm run doctor`: Alias de `governance:check` para onboarding rápido.
- `npm run quality:lint`: Ejecuta el linter en todo el monorepo.
- `npm run quality:dep-graph`: Analiza las dependencias y detecta violaciones de límites (dependency-cruiser).
- `npm run governance:scorecard`: Reporta scopes/tipos activos y estado de cobertura de gobernanza.

## Producción y Seguridad

- `./tools/enforce-production-readiness.sh`: Bloquea placeholders de secretos y regresiones de pipeline.
- `security:*` scripts: Generación de SBOM, firma de artefactos y validación de políticas OPA.
- En producción quedan prohibidos los providers simulados para timbrado fiscal.

## Comandos oficiales (golden path)

1. `npm run doctor`
2. `npm run quality:lint`
3. `npm run test:unit`
4. `npm run arch:check`
5. `npm run readiness:check`

## CI/CD

El flujo principal de CI/CD se encuentra en `.github/workflows/ci-cd.yml`, integrando validaciones de arquitectura, seguridad y calidad en cada etapa.

## Readiness comercial y evidencia de release

- `npm run readiness:commercial`: valida matriz país/módulo y bloquea estados inconsistentes.
- `npm run quality:docs`: detecta drift entre documentación y árbol real del repo.
- `npm run readiness:evidence`: genera `evidence/releases/<version>/` con summary, manifest y huellas SHA-256.
- `npm run readiness:report`: genera reporte consolidado en `evidence/reports/RELEASE_READINESS_REPORT.md`.

Ver también: [Release Trust Packet](docs/commercial/release-trust-packet.md) y [POC Execution Matrix](docs/readiness/poc-execution-matrix.md).

## Fuente de verdad documental

La clasificación normativa/operativa/referencia/histórica del monorepo está en [docs/governance/source-of-truth.md](docs/governance/source-of-truth.md).
