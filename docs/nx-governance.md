# Nx Governance Baseline (Progressive Hardening)

## Taxonomía de tags (obligatoria)
Todos los `project.json` dentro de `apps/` y `libs/` deben declarar las 4 familias base:

- `scope:*`
- `type:*`
- `platform:*`
- `criticality:*`

Además, para proyectos `criticality:high` se requieren estas familias extendidas:

- `compliance:*`
- `tenant-mode:*`
- `region:*`

No se permiten familias legacy como `domain:*`.

## Enforcement técnico

### 1) Boundaries por ESLint
`@nx/enforce-module-boundaries` se mantiene sin fallback permisivo global y con restricciones por capa + scope.

### 2) Validación automática de tags
Se endureció el guard de taxonomía para **todo el monorepo**:

```bash
npm run validate:nx-tags
```

El comando valida:
- familias obligatorias base;
- reglas condicionales por criticidad (`criticality:high` exige `compliance:*`, `tenant-mode:*`, `region:*`);
- formato `familia:valor` en minúsculas + kebab-case;
- catálogo de valores permitidos para `type`, `platform`, `criticality`, `compliance`, `tenant-mode`, `region`;
- migración gradual con `TAG_POLICY_MODE=warn|error` (por defecto `warn`, estricto en `error`).

### 3) CI gates
El pipeline ejecuta `npm run validate:nx-tags` antes de `nx affected --target=lint`.

## Convenciones de estructura
- Apps frontend deben vivir en `apps/frontend/*`.
- Apps backend deben vivir en `apps/backend/*`.
- Se movió `ops-console-web` y su e2e a `apps/frontend/virteex-ops*` para alinear ubicación física con runtime y ownership.

## Política de evolución
Para cambios de arquitectura en tags o boundaries:
1. actualizar convención en este documento;
2. actualizar `tools/validate-project-tags.mjs`;
3. ejecutar normalización de `project.json`;
4. validar con `npm run validate:nx-tags` y lint affected.

## Convención apps backend como composition root
- `apps/backend/*` debe permanecer como **app shell**: bootstrap, wiring de módulos y configuración de borde.
- Resolvers, DTOs de transporte y validaciones de entrada se centralizan en `libs/domains/*/presentation`.
- Adaptadores concretos (gateways/repositorios HTTP/DB) se centralizan en `libs/domains/*/infrastructure`.
- Para proyectos desplegables (`projectType: application`) se exige `type:app` (excepto apps e2e que usan `type:e2e`).
