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
- `npm run quality:lint`: Ejecuta el linter en todo el monorepo.
- `npm run quality:dep-graph`: Analiza las dependencias y detecta violaciones de límites (dependency-cruiser).

## Producción y Seguridad

- `./tools/enforce-production-readiness.sh`: Bloquea placeholders de secretos y regresiones de pipeline.
- `security:*` scripts: Generación de SBOM, firma de artefactos y validación de políticas OPA.
- En producción quedan prohibidos los providers simulados para timbrado fiscal.

## CI/CD

El flujo principal de CI/CD se encuentra en `.github/workflows/ci-cd.yml`, integrando validaciones de arquitectura, seguridad y calidad en cada etapa.
