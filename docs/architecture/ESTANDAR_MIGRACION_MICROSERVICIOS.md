# INFORME ARQUITECTÓNICO DETALLADO: ESTÁNDAR DE MIGRACIÓN Y ESTRUCTURA DE MICROSERVICIOS (VIRTEEX ERP)

**Fecha:** 2026-03-28
**Estado:** Obligatorio / Guía de Ejecución
**Versión:** 1.0
**Contexto:** Remediación Multi-tenant 5/5

---

## 1. OBJETIVO

Define y ejecuta una estructura unificada para todos los microservicios del monorepo que sea:
- Robusta
- Escalable
- Mantenible
- Gobernable
- Alineada con Clean Architecture + DDD, seguridad por diseño, observabilidad operativa, evolución controlada de contratos y despliegue multi-tenant / multi-región.

La propuesta se fundamenta en la gobernanza automática por CI y este informe incluye:
1. Diagnóstico del estado actual de los microservicios.
2. Problemas y riesgos técnicos detectados.
3. Estructura objetivo estándar por microservicio.
4. Estructura objetivo para librerías de dominio.
5. Convenciones para interfaces, tipos, puertos y contratos.
6. Reglas de dependencia.
7. Plantilla mínima por tipo de servicio.
8. Estrategia de migración por fases.
9. Criterios de aceptación para certificar un servicio.

---

## 2. ALCANCE DEL ANÁLISIS

Aplica estas reglas a todos los microservicios backend y workers ubicados en:
- `apps/service/*/app`
- `apps/worker/*/app`

**Microservicios de negocio analizados:**
accounting, admin, bi, billing, catalog, crm, fiscal, fixed-assets, gateway, identity, inventory, manufacturing, payroll, plugin-host, pos, projects, purchasing, subscription, treasury.

**Workers analizados:**
worker-notification, worker-scheduler.

*Exclusiones: No se consideran en este informe como microservicios internos de dominio apps/edge y apps/client, ya que pertenecen a capas de frontend, BFF o experiencia.*

---

## 3. DIAGNÓSTICO ACTUAL

Identifica y corrige los siguientes hallazgos durante la migración:
1. Existe una base consistente en Nx/NestJS para build, serve y test.
2. La estructura interna de `src/` es heterogénea entre servicios.
3. Existen varios servicios en estado mínimo o esqueleto.
4. Algunos servicios ya muestran mayor madurez (billing, fiscal, plugin-host, inventory, identity), pero aún mezclan responsabilidades dentro de `app/`.
5. `gateway` se percibe incompleto como aplicación ejecutable.
6. `pos` presenta una estructura mínima no homogénea respecto al resto.
7. Los workers muestran modularidad básica, pero todavía no comparten un patrón uniforme con servicios HTTP o event-driven.

**Inventario resumido (unidades de análisis):**
- accounting: 4 / 1
- admin: 4 / 1
- bi: 4 / 1
- billing: 13 / 3
- catalog: 8 / 2
- crm: 6 / 1
- fiscal: 9 / 3
- fixed-assets: 4 / 1
- gateway: 1 / 0
- identity: 8 / 3
- inventory: 8 / 3
- manufacturing: 4 / 1
- payroll: 4 / 1
- plugin-host: 13 / 3
- pos: 3 / 0
- projects: 4 / 1
- purchasing: 4 / 1
- subscription: 7 / 1
- treasury: 4 / 1
- worker-notification: 8 / 2
- worker-scheduler: 7 / 2

**Conclusión del estado actual:**
La plataforma tiene una base adecuada para escalar, pero todavía no existe una plantilla interna obligatoria por servicio. Si no se normaliza la estructura, el costo de mantenimiento crecerá de forma no lineal en onboarding, calidad de pruebas, consistencia operativa, acoplamiento accidental y deuda técnica transversal.

---

## 4. PROBLEMAS ARQUITECTÓNICOS PRINCIPALES A ELIMINAR

Evita y resuelve los siguientes problemas detectados:

- **P1. Mezcla de responsabilidades:** Controllers, lógica de aplicación, validaciones, acceso a datos y contratos conviven en espacios poco delimitados.
- **P2. Contratos no uniformes:** No existe una convención única para DTOs, eventos, schemas y versionado, ni para la compatibilidad backward.
- **P3. Uso inconsistente de interfaces y tipos:** En algunos casos, tipos o interfaces compartidas viven dentro de archivos de implementación (`*.service.ts`, `*.repository.ts`, etc.), y luego otros módulos importan dichos archivos solo para acceder al contrato. Esto genera acoplamiento innecesario, imports confusos, peor mantenibilidad y mayor riesgo de ciclos.
- **P4. Testing desigual:** La estructura de pruebas no es uniforme y algunos servicios no cubren escenarios críticos por capa.
- **P5. Observabilidad no normalizada:** No todos los servicios exponen de forma consistente métricas, tracing, health/readiness, correlation IDs y logs estructurados con contexto.
- **P6. Seguridad operativa no encapsulada:** Tenant context, auth, rate limiting, audit trail, headers de seguridad e idempotencia no están organizados en puntos predecibles.
- **P7. Desbalance entre apps y libs:** La arquitectura del repositorio sugiere que la lógica de negocio viva en `libs/`, pero parte de ella sigue concentrándose en `app/src`.
- **P8. Riesgo de boilerplate transversal:** Observabilidad, tenancy, seguridad e idempotencia podrían terminar duplicadas en cada app si no se consolidan como librerías de plataforma compartidas.

---

## 5. PRINCIPIOS RECTORES

Aplica estos 10 principios sin excepción:
1. El microservicio ejecutable orquesta; no concentra negocio complejo.
2. La lógica de negocio vive en librerías de dominio reutilizables.
3. Los contratos compartidos no deben vivir dentro de archivos de implementación.
4. Toda integración externa se encapsula detrás de adapters o ports.
5. Todo contrato público debe versionarse.
6. Todo servicio productivo debe ser observable, trazable y operable.
7. La seguridad y el contexto multi-tenant deben formar parte del estándar.
8. La arquitectura debe poder gobernarse automáticamente desde CI.
9. No todos los servicios requieren el mismo nivel de complejidad desde el día 1.
10. La estandarización debe reducir deuda, no multiplicar boilerplate.

---

## 6. ESTRUCTURA OBJETIVO (MICROSERVICIOS Y LIBRERÍAS)

### 6.A) ESTRUCTURA ESTÁNDAR PARA CADA MICROSERVICIO (`apps/service/<name>/app/`)

Ejecuta la creación del siguiente árbol de directorios:

```text
apps/service/<service-name>/app/
├── project.json
├── tsconfig*.json
├── jest.config|vitest.config
├── Dockerfile
├── README.md
├── .env.example
└── src/
    ├── main.ts
    ├── bootstrap/
    │   ├── app.factory.ts
    │   └── config.loader.ts
    ├── config/
    │   ├── app.config.ts
    │   ├── env.schema.ts
    │   ├── feature-flags.config.ts
    │   ├── security.config.ts
    │   └── tenancy.config.ts
    ├── modules/
    │   ├── http/
    │   │   ├── controllers/
    │   │   ├── dto/
    │   │   ├── mappers/
    │   │   ├── filters/
    │   │   └── interceptors/
    │   ├── graphql/                    (si aplica)
    │   │   ├── resolvers/
    │   │   ├── dto/
    │   │   └── mappers/
    │   ├── messaging/
    │   │   ├── consumers/
    │   │   ├── producers/
    │   │   └── message-mappers/
    │   ├── health/
    │   ├── observability/
    │   ├── security/
    │   ├── tenancy/
    │   ├── idempotency/
    │   ├── audit/
    │   └── scheduling/                 (si aplica)
    ├── composition/
    │   ├── dependency-injection.module.ts
    │   ├── use-case.providers.ts
    │   ├── repository.providers.ts
    │   └── adapter.providers.ts
    ├── integrations/
    │   ├── db/
    │   │   ├── orm.config.ts
    │   │   ├── migrations/
    │   │   └── entities/                 (solo modelos técnicos ORM)
    │   ├── cache/
    │   ├── queue/
    │   └── external-clients/
    ├── contracts/
    │   ├── api/
    │   │   ├── v1/
    │   │   └── v2/
    │   ├── events/
    │   └── schemas/
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   ├── contract/
    │   ├── e2e/
    │   ├── fixtures/
    │   └── testcontainers/
    └── scripts/
        ├── seed.ts
        ├── smoke.ts
        └── migrate.ts
```

**Principios obligatorios de esta estructura:**
1. `app/` solo compone runtime, adapters de entrada y configuración.
2. La lógica de negocio no debe residir en controllers, resolvers ni consumers.
3. Toda dependencia hacia infraestructura se inyecta por ports o adapters.
4. Los contratos públicos deben estar versionados.
5. Todo servicio productivo expone health, readiness, liveness y metrics.
6. Todo servicio propaga tenantId, requestId, traceId y region.
7. Las capacidades transversales deben preferentemente venir de libs de plataforma compartidas, no de implementaciones aisladas por app.

### 6.B) ESTRUCTURA ESTÁNDAR PARA LIBRERÍAS DE DOMINIO (`libs/domain/<domain>/`)

Implementa el negocio siguiendo este árbol:

```text
libs/domain/<domain>/
├── domain/
│   └── src/lib/
│       ├── entities/
│       ├── value-objects/
│       ├── services/
│       ├── events/
│       ├── policies/
│       ├── errors/
│       └── ports/                      # Puertos de salida (Interfaces)
├── application/
│   └── src/lib/
│       ├── use-cases/
│       ├── orchestrators/
│       ├── commands/
│       ├── queries/
│       ├── validators/
│       ├── mappers/
│       ├── ports/                      (si el puerto pertenece a application)
│       └── types/
├── infrastructure/
│   └── src/lib/
│       ├── repositories/
│       ├── adapters/
│       ├── persistence/
│       ├── outbox/
│       └── clients/
└── contracts/
    └── src/lib/
        ├── api/
        ├── events/
        └── schemas/
```

**Regla estratégica:**
- Microservicio ejecutable: punto de entrada y composición.
- Librerías de dominio: fuente real del negocio.
- Librerías de infraestructura: implementación de puertos.
- Contratos: definición formal y versionada de fronteras.

### 6.C) ESTRUCTURA PARA LIBRERÍAS DE PLATAFORMA COMPARTIDAS (`libs/platform/`)

Centraliza lo transversal en:
- `observability/`: tracing, logging estructurado, métricas base.
- `security/`: guards comunes, headers, rate limiting, auth helpers.
- `tenancy/`: extracción, validación y propagación del tenant context.
- `idempotency/`: interceptor, store y políticas comunes.
- `health/`: readiness/liveness base.
- `messaging/`: utilidades de consumidores/productores, retries, DLQ.
- `config/`: carga tipada y validación estándar.
- `http/`: clientes HTTP y helpers.
- `testing/`: factories, fixtures, testcontainers comunes.

**Regla:** Lo transversal debe centralizarse en plataforma siempre que no implique acoplar negocio.

---

## 7. CONVENCIÓN PARA INTERFACES, TIPOS, PUERTOS Y CONTRATOS

Sigue estas reglas para evitar imports incorrectos y mezcla de contratos con implementaciones:

### 7.1 Principio general
Los contratos compartidos no deben declararse dentro de archivos de implementación si van a ser reutilizados por otros módulos.

### 7.2 Regla principal
Está desaconsejado hacer esto:
`// invoice.service.ts`
`export interface CreateInvoicePayload { ... }`
`export class InvoiceService { ... }`
y luego importar `invoice.service.ts` desde otros módulos solo para usar `CreateInvoicePayload`.

### 7.3 Separación por rol arquitectónico

**a) Ports**
Contratos para repositorios, buses, auditores, servicios externos o stores de idempotencia.
- Ubicación recomendada: `domain/ports/` o `application/ports/`.
- Ejemplos: `invoice-repository.port.ts`, `event-bus.port.ts`, `audit.port.ts`.

**b) Contracts**
Contratos públicos compartidos entre bounded contexts o expuestos al exterior.
- Ubicación recomendada: `contracts/api/`, `contracts/events/` o `contracts/schemas/`.
- Ejemplos: `create-invoice.request.ts`, `invoice-issued.v1.ts`.

**c) DTOs**
Objetos de entrada/salida del transporte HTTP/GraphQL.
- Ubicación recomendada: `modules/http/dto/` o `presentation/dto/`.
- Ejemplos: `create-invoice.request.dto.ts`, `create-invoice.response.dto.ts`.

**d) Commands / Queries**
Objetos del caso de uso.
- Ubicación recomendada: `application/commands/` o `application/queries/`.

**e) Types**
Tipos auxiliares internos no públicos.
- Ubicación recomendada: `application/types/`, `domain/types/` o `<modulo>/types/`.

### 7.4 Sobre carpetas genéricas interfaces/
Quedan desaconsejadas como patrón general. Motivo: se vuelven cajones de sastre, mezclan interfaces de distinta naturaleza y ocultan el rol arquitectónico real del contrato. Se prefiere organizar por función, no por palabra reservada.

### 7.5 Sobre DI en NestJS
Cuando un contrato se use como token de inyección, se recomienda usar: `abstract class`, `Symbol` o tokens explícitos. No se debe depender de interface pura como token de DI porque no existe en runtime.

### 7.6 Regla formal
Ningún archivo de implementación (`*.service.ts`, `*.repository.ts`, `*.controller.ts`, `*.consumer.ts`) debe exportar contratos reutilizables consumidos por otros módulos, salvo casos estrictamente locales.

---

## 8. REGLAS DE DEPENDENCIA (NO NEGOCIABLES)

- **R1:** `domain` no depende de framework, infraestructura ni presentación.
- **R2:** `application` depende de `domain` y, cuando aplique, de `contracts`.
- **R3:** `infrastructure` implementa puertos definidos por `domain` o `application`.
- **R4:** `presentation` (HTTP, GraphQL, eventos) solo invoca use-cases u orchestrators.
- **R5:** `contracts` es transversal y versionado.
- **R6:** `app` executable solo compone módulos, providers y configuración de runtime.
- **R7:** Está prohibido acceder a DB directamente desde controller, resolver o consumer.
- **R8:** Todo publish de eventos críticos usa **Outbox + Idempotencia**.
- **R9:** DTOs y eventos públicos deben versionarse con política explícita de compatibilidad y deprecación.
- **R10:** Se bloquean ciclos con reglas de Nx, ESLint boundaries y dep-cruiser.
- **R11:** Los contratos compartidos no deben vivir dentro de archivos de implementación.
- **R12:** Las carpetas genéricas `interfaces/` o `shared/interfaces/` quedan desaconsejadas salvo excepciones justificadas.
- **R13:** Lo transversal de plataforma debe centralizarse en `libs/platform/*` siempre que sea reusable entre servicios.

---

## 9. PLANTILLA MÍNIMA POR NIVEL DE MADUREZ

Para evitar sobrediseño, se define un modelo por niveles:

### Nivel 1: Servicio mínimo productivo
Aplica a servicios simples o nuevos. Debe incluir: `main.ts`, `bootstrap/`, `config/env.schema.ts`, `modules/http` o `modules/messaging`, `modules/health`, `modules/observability`, `composition/`, `integrations/`, `tests/integration`, `tests/e2e`.

### Nivel 2: Servicio con integraciones o eventos
Además del Nivel 1: `contracts/api` y/o `contracts/events`, `idempotency`, `audit`, integración de mensajería, `contract tests`, `outbox` si publica eventos.

### Nivel 3: Servicio crítico o regulado
Además del Nivel 2: SLO definido, dashboards y alertas, hardening de seguridad, políticas de auditoría completas, DR smoke tests, canary checks, firma de artefactos, SBOM.

---

## 10. CHECKLIST DE COMPLETITUD PARA CERTIFICACIÓN

Un microservicio se considera productivo cuando cumple al menos:

**Arquitectura:**
- Estructura base implementada.
- Sin violaciones de dependencia.
- Lógica de negocio fuera del app executable.

**Calidad:**
- Al menos 1 integration test.
- Al menos 1 contract test si expone contratos.
- Al menos 1 e2e smoke.
- Validación estricta de env.

**Operación:**
- Readiness/liveness/metrics.
- Logging JSON estructurado.
- Tracing habilitado.
- Correlation IDs propagados.

**Seguridad:**
- Tenant context validado.
- Auth/autz según criticidad.
- Idempotencia en endpoints o eventos críticos.
- Auditoría en operaciones sensibles.

**Entrega:**
- Build reproducible.
- Gates de CI.
- Convenciones de estructura verificables.

---

## 11. CONVENCIONES RECOMENDADAS

1. **Naming:** Archivos: `kebab-case`. Clases: `PascalCase`. Puertos: `*.port.ts`. Repositorios: `*.repository.ts`. Use-cases: `<action>-<aggregate>.use-case.ts`. DTOs: `<action>.request.dto.ts`, `<action>.response.dto.ts`.
2. **Módulos:** Un módulo por capability. Evitar `app.module` gigantes y carpetas `common/` sin criterio claro.
3. **Errores:** Errores de dominio tipados. Mapping explícito de error de dominio a error de transporte.
4. **Configuración:** `env.schema.ts` obligatorio. Sin secretos hardcodeados. Feature flags centralizadas.
5. **Seguridad:** Guards por auth, permisos y tenant context. Sanitización de input/output. Idempotencia, headers y rate limiting según criticidad.
6. **Observabilidad:** Logs con service, env, tenantId, requestId, traceId, region. Métricas RED y USE. Trazabilidad de extremo a extremo.
7. **Imports:** Si solo se consume un tipo, usar `import type`. No importar una implementación solo para reutilizar una interfaz o tipo.

---

## 12. MAPA DE APLICACIÓN POR TIPO DE SERVICIO

- **Tipo A: API Sincrónica:** Incluye `modules/http`, `modules/graphql` si aplica, `contracts/api`, `tests/e2e`.
- **Tipo B: Event-driven:** Incluye `modules/messaging`, `contracts/events`, `outbox`, `retries`, `DLQ`, `contract tests`.
- **Tipo C: Worker Programado:** Incluye `modules/scheduling`, handlers, locks distribuidos, idempotencia, métricas.
- **Tipo D: Gateway:** Debe tener plantilla propia y más liviana. Responsabilidades: routing, authn/authz, tenant resolution, rate limiting, observabilidad, resiliencia. No debe contener lógica de dominio.

---

## 13. PROPUESTA DE ADOPCIÓN POR SERVICIO Y TIERS

### Tier 1: Prioridad inmediata
`gateway`, `billing`, `fiscal`, `identity`, `inventory`, `plugin-host`, `subscription`.
- **Objetivo:** Completar estructura estándar, extraer lógica fuera de `app/`, normalizar observabilidad y seguridad.

### Tier 2: Dominio core en expansión
`catalog`, `crm`, `pos`, `treasury`, `accounting`, `purchasing`, `projects`.
- **Objetivo:** Migración por capabilities, contratos y testing homogéneos.

### Tier 3: Servicios esqueleto o de menor complejidad actual
`admin`, `bi`, `fixed-assets`, `manufacturing`, `payroll`.
- **Objetivo:** Construir con generator oficial desde el estándar.

### Workers
`worker-notification`, `worker-scheduler`.
- **Objetivo:** Adoptar plantilla worker propia, unificar locks, retries, idempotencia y métricas.

---

## 14. PLAN DE MIGRACIÓN POR FASES

- **Fase 0 - Baseline:** Definir generator Nx oficial (`service-standard-v1`, `worker-standard-v1`, `gateway-standard-v1`), definir checklist de arquitectura en CI y definir librerías `libs/platform/*`.
- **Fase 1 - Estandarización estructural:** Reorganizar carpetas sin cambiar comportamiento, introducir health, observability, security y tenancy, y corregir contratos mal ubicados dentro de implementaciones.
- **Fase 2 - Extracción de negocio a libs:** Mover reglas de negocio desde `app/src` a `libs/domain/*`, extraer puertos, commands, queries y errores de dominio, e introducir contract tests donde aplique.
- **Fase 3 - Hardening operativo:** Outbox, idempotencia transversal, DLQ y retries formales, tracing consolidado, dashboards y alertas.
- **Fase 4 - Gobernanza automática:** Gate de estructura mínima, gate de boundaries, gate de contratos versionados y gate de pruebas mínimas por criticidad.

---

## 15. CRITERIOS DE ACEPTACIÓN DE LA NUEVA ESTRUCTURA

Un microservicio queda certificado cuando cumple:
- **A. Arquitectura:** Estructura objetivo aplicada según su tipo y nivel, dependencias correctas entre capas y contratos fuera de implementaciones.
- **B. Calidad:** Suite mínima de pruebas exigida por criticidad, contract tests para fronteras públicas y smoke e2e.
- **C. Operación:** Readiness/liveness/metrics, tracing y correlation IDs activos y logs estructurados.
- **D. Seguridad:** Tenant context validado, auth/autz donde corresponda, auditoría e idempotencia crítica.
- **E. Entrega:** Build reproducible, CI gates y artefactos auditables.

---

## 16. RECOMENDACIÓN FINAL

Sí se recomienda imponer una estructura única para todos los microservicios, con estas precisiones:
1. La estructura debe distinguir claramente entre runtime, dominio y plataforma compartida.
2. Los contratos reutilizables no deben vivir dentro de archivos de implementación.
3. Las carpetas genéricas `interfaces/` deben evitarse como patrón general.
4. Gateway y workers deben tener plantillas específicas.
5. La estandarización debe aplicarse por niveles de madurez para no sobrediseñar servicios pequeños.

**Próximo paso recomendado:** Crear los generators (`service-standard-v1`, `worker-standard-v1`, `gateway-standard-v1`) y comenzar la migración por `gateway`, `billing`, `fiscal`, `identity`.

---

## 17. ANEXO: REGLA RESUMIDA SOBRE INTERFACES

- **Correcto:** Extraer interfaces compartidas a archivos propios, ubicar cada contrato según su rol (`ports/`, `contracts/`, `dto/`, `types/`) y usar `abstract class` o tokens para DI en NestJS.
- **Incorrecto:** Importar un service, repository o controller solo para usar una interfaz, meter todo en `interfaces/` y mezclar contrato e implementación en el mismo archivo cuando el contrato se reutiliza.

---
