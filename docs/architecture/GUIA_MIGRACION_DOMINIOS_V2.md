# INFORME ARQUITECTÓNICO DEFINITIVO v2.0: GUÍA DE MIGRACIÓN DE DOMINIOS (VIRTEEX MONOREPO)

**Fecha:** 2026-03-28 (UTC)
**Estado:** Obligatorio / Guía de Ejecución
**Contexto:** Estandarización de estructura para TODOS los dominios

Esta guía establece el estándar obligatorio para la migración y estructuración de todos los dominios en el monorepo Virteex. Siga estas instrucciones de forma imperativa para garantizar la consistencia, escalabilidad y mantenibilidad del sistema. No resuma ni simplifique ningún paso.

---

## 1. OBJETIVO

Definir un estándar canónico adaptable que todos los dominios del monorepo deben seguir, garantizando:

- Clean Architecture + DDD
- Multi-tenant y multi-región
- Seguridad/compliance by design
- Observabilidad, performance y operabilidad desde el diseño

Este documento establece una estructura base con variantes controladas (no ad‑hoc), reglas de dependencia estrictas, convenciones de nombres y testing, y un plan de adopción por fases.

---

## 2. DIAGNÓSTICO Y PRINCIPIOS RECTORES

### 2.1 Hallazgos previos (Diagnóstico)

- **Heterogeneidad estructural:** Existe una falta de uniformidad entre dominios (finops, scheduler, notification, pos, subscription).
- **Riesgos identificados:** Dificultad en el onboarding, lógica de negocio dispersa en capas incorrectas y complicaciones para aplicar quality gates uniformes en el CI.

### 2.2 Principios que guían este estándar

1.  **Adaptabilidad:** Un solo estándar con perfiles, no una plantilla rígida.
2.  **Separación de intereses:** Capas con responsabilidades únicas.
3.  **Contratos versionados:** Evitan romper consumidores externos o internos.
4.  **Enforcement automático:** Reglas validadas en CI (ESLint, dependency-cruiser), no solo por convención.
5.  **Código como documentación:** Estructura autoexplicativa que facilita la navegación.

---

## 3. PERFILES DE DOMINIO

Cada dominio pertenece a uno de estos tres perfiles. La asignación es obligatoria, se declara en el `README.md` del dominio y condiciona qué partes del estándar son obligatorias u opcionales.

| Perfil             | Descripción                                                        | Ejemplos                        |
| :----------------- | :----------------------------------------------------------------- | :------------------------------ |
| **core-domain**    | Contiene reglas de negocio críticas, expone APIs síncronas.        | billing, identity, inventory    |
| **service-domain** | Orquestación, workers, integraciones. Puede no tener presentación. | notification, scheduler, finops |
| **ui-domain**      | Incluye frontend específico del dominio (si aplica).               | pos, shopfloor, admin           |

---

## 4. ESTRUCTURA CANÓNICA POR DOMINIO

Aplique la siguiente estructura en la ruta base `libs/domain/<dominio>/`.

### 4.1 Estructura base (Obligatoria para todos los perfiles)

```text
libs/domain/<dominio>/
├── README.md                  # Propósito, perfil, owners, enlaces
├── OWNERS                     # Equipo responsable
├── CHANGELOG.md               # Historial de cambios versionados
├── docs/                      # ADRs, guías de migración, arquitectura
│   ├── adr/                   # Decisiones arquitectónicas (ADRs)
│   └── migration-guide.md     # Notas específicas de la migración del dominio
├── domain/                    # Núcleo de negocio puro (OBLIGATORIO)
│   └── src/
│       ├── entities/          # Entidades de negocio
│       ├── value-objects/     # Objetos de valor
│       ├── aggregates/        # Agregados raíz
│       ├── domain-services/   # Servicios de dominio sin estado
│       ├── events/            # Eventos de dominio (versión semántica)
│       ├── policies/          # Reglas de negocio reutilizables
│       ├── specifications/    # Consultas de negocio reutilizables
│       ├── repository-ports/  # Interfaces de repositorios (solo tipos)
│       ├── factories/         # Creación compleja de agregados
│       ├── errors/            # Errores de dominio
│       └── index.ts           # Barrel file con solo tipos (export type)
├── application/               # Casos de uso (OBLIGATORIO)
│   └── src/
│       ├── use-cases/         # Comandos, queries y workflows
│       │   ├── commands/
│       │   │   └── <nombre-caso>/
│       │   │       ├── <nombre>.command.ts
│       │   │       ├── <nombre>.handler.ts
│       │   │       └── <nombre>.result.ts
│       │   ├── queries/
│       │   │   └── <nombre-caso>/
│       │   │       ├── <nombre>.query.ts
│       │   │       └── <nombre>.handler.ts
│       │   └── workflows/
│       ├── services/          # Servicios de aplicación orquestadores
│       ├── handlers/          # Manejadores de eventos de dominio
│       ├── dto/               # DTOs de entrada/salida para casos de uso
│       ├── mappers/           # Mapeo entre agregados y DTOs
│       ├── ports/             # Puertos (interfaces)
│       │   ├── inbound/       # Puertos que expone el dominio (ej. casos de uso)
│       │   └── outbound/      # Puertos que el dominio necesita (repos, externos)
│       ├── sagas/             # Coordinación de procesos largos
│       ├── validators/        # Validaciones específicas de aplicación
│       ├── authorization/     # Políticas de autorización
│       └── index.ts           # Barrel file de aplicación
├── contracts/                 # Contratos versionados (OBLIGATORIO)
│   └── src/
│       ├── api/
│       │   ├── v1/            # Versión mayor 1
│       │   │   ├── requests/
│       │   │   ├── responses/
│       │   │   └── index.ts
│       │   └── v2/            # Versión mayor 2
│       ├── events/
│       │   ├── v1/
│       │   │   ├── <evento>.event.ts
│       │   │   └── schemas/   # JSON Schema / Avro / Protobuf
│       │   └── v2/
│       ├── messages/          # Mensajes de integración
│       ├── shared/            # Tipos compartidos entre contratos
│       ├── compatibility/     # Reglas de compatibilidad backward
│       └── index.ts           # Barrel file de contratos
├── infrastructure/            # Adaptadores concretos (OBLIGATORIO)
│   └── src/
│       ├── persistence/
│       │   ├── orm/           # Configuración de ORM
│       │   ├── entities/      # Entidades de infraestructura (tablas)
│       │   ├── repositories/  # Implementaciones de repository-ports
│       │   ├── migrations/    # Scripts de migración
│       │   └── read-models/   # Modelos optimizados para consultas
│       ├── messaging/
│       │   ├── outbox/        # Implementación de outbox transaccional
│       │   ├── producers/
│       │   ├── consumers/
│       │   └── serializers/
│       ├── integrations/
│       │   ├── http/          # Clientes HTTP
│       │   ├── grpc/
│       │   └── adapters/      # Adaptadores a servicios externos (ACL)
│       ├── caching/           # Implementaciones de caché
│       ├── tenancy/           # Resolución de tenant
│       ├── security/          # Encriptación, hashing, masking
│       ├── observability/     # Métricas, tracing, logging (config técnica)
│       └── index.ts           # Barrel file de infraestructura
├── presentation/              # Adaptadores de entrada (Opcional según perfil)
│   └── src/
│       ├── http/
│       │   ├── controllers/   # Llaman a casos de uso
│       │   ├── routes/        # Definición de rutas
│       │   ├── request-dto/   # Solo si requiere decoradores del framework
│       │   ├── response-dto/  # Re-exportar desde contracts
│       │   └── middlewares/
│       ├── graphql/           # Resolvers y schemas
│       ├── guards/            # Guards de autenticación/autorización
│       ├── interceptors/      # Logging, tracing, etc.
│       ├── filters/           # Filtros de excepciones
│       └── index.ts           # Barrel file de presentación
├── ui/                        # Solo para ui-domain
│   └── src/
│       ├── pages/             # Páginas/rutas
│       ├── components/        # Componentes reutilizables
│       ├── state/             # Estado global (signals, redux)
│       ├── services/          # Servicios que llaman a presentación
│       ├── hooks/             # Custom hooks
│       ├── forms/             # Gestión de formularios
│       ├── i18n/              # Traducciones
│       └── index.ts           # Barrel file de UI
├── testing/                   # Suites transversales
│   ├── contract/              # Pruebas de contrato (Pact)
│   ├── e2e/                   # Pruebas de extremo a extremo
│   ├── performance/           # Pruebas de carga y estrés
│   ├── security/              # Pruebas de seguridad (SAST/DAST)
│   └── architecture/          # Validaciones de límites (dependency-cruiser)
└── project.json               # Configuración Nx (tags, targets)
```

### 4.2 Reglas Detalladas por Capa

#### Capa Domain

- **Aislamiento:** No importe nada externo a `domain` (ni `contracts`).
- **Interfaces:** Cada interfaz en su propio archivo (ej. `user.repository.port.ts`).
- **Exportación:** Use `export type` en barrel files para no exponer implementaciones.

#### Capa Application

- **Dependencias:** Puede depender de `domain` y `contracts` (solo tipos). Prohíba depender de `infrastructure` o `presentation`.
- **Puertos Outbound:** Son interfaces; sus implementaciones viven en `infrastructure`.

#### Capa Contracts

- **DTOs:** No defina DTOs en `presentation` que dupliquen `contracts`.
- **Consumo:** `presentation` debe importar DTOs desde `contracts` directamente.
- **Versionado:** Cualquier cambio rompedor exige una nueva versión mayor (`v1` -> `v2`).

#### Capa Infrastructure

- **Dependencias:** Puede depender de `domain`, `application` y `contracts`.
- **Exportación:** Exponga solo implementaciones concretas, no interfaces.

#### Capa Presentation

- **Lógica:** Prohíba lógica de negocio; delegue siempre a `application`.
- **Acceso:** Prohíba el acceso directo a `infrastructure`.

#### Capa UI

- **Dependencias:** Puede depender de `contracts` y `presentation`, pero nunca de `infrastructure` directamente.

---

## 5. REGLAS DE DEPENDENCIA (OBLIGATORIAS)

La dirección permitida es: `domain ← application ← presentation`.

1.  **domain** no depende de nada externo.
2.  **application** depende de `domain` y `contracts` (tipos).
3.  **presentation** depende de `application` y `contracts`.
4.  **infrastructure** depende de `domain`, `application` y `contracts`.
5.  **ui** depende de `contracts` y `presentation`.
6.  **ENTRE DOMINIOS:** Prohíba ciclos. Use `contracts` (API/Eventos) y **Anti-Corruption Layer (ACL)** en `infrastructure/integrations/adapters`.

**Enforcement:** ESLint (@nrwl/nx/enforce-module-boundaries), dependency-cruiser y tests de arquitectura con ts-morph.

---

## 6. MODELO DE SUBMÓDULOS INTERNOS

Organice el código por **Bounded Contexts** internos dentro de cada capa para evitar que el dominio crezca desmesuradamente.

Ejemplo para `billing` en `application/src/use-cases/`:

- `invoices/` (commands/queries)
- `payments/` (commands/queries)
- `credit-notes/` (commands/queries)

Aplique este principio también en `domain/src/aggregates/`, `domain/src/domain-services/`, etc.

---

## 7. SHARED KERNEL Y DEPENDENCIAS ENTRE DOMINIOS

### 7.1 Shared Kernel

- Ubicación: `libs/shared/<tipo>/` (ej. `libs/shared/types`).
- Contenido: Código genérico y estable sin lógica de negocio.
- Restricción: `shared` no puede importar desde ningún dominio.

### 7.2 Comunicación

- **Síncrona:** Vía APIs expuestas por `presentation`. El consumidor usa un adaptador en `infrastructure/integrations/http`.
- **Asíncrona:** Vía eventos publicados en `contracts/events/`. El consumidor suscribe un `handler` en `application/handlers`.

### 7.3 Anti-Corruption Layer (ACL)

Obligatorio al depender de otro dominio. Cree la ACL en `infrastructure/integrations/adapters` para traducir modelos externos a internos.

---

## 8. ESTRATEGIA DE TESTING

| Capa               | Tests Requeridos                          | Cobertura Mínima |
| :----------------- | :---------------------------------------- | :--------------- |
| **domain**         | Unit + property tests                     | ≥ 80%            |
| **application**    | Unit + contract tests de puertos inbound  | ≥ 70%            |
| **infrastructure** | Integration con testcontainers            | Críticos         |
| **presentation**   | E2E de rutas críticas                     | Happy path       |
| **architecture**   | dependency-cruiser, boundaries, no cycles | 100%             |

---

## 9. ESTÁNDARES TRANSVERSALES

- **Seguridad:** Middleware de tenant context en `presentation`. Autorización en `application`. Sanitización y masking en `infrastructure/observability`.
- **Observabilidad:** TraceId, RequestId, TenantId y Region obligatorios. Métricas por caso de uso.
- **Resiliencia:** Idempotencia en comandos críticos. Retries con backoff y Circuit Breaker. Outbox transaccional para eventos.
- **Datos:** Migraciones idempotentes. Separación de modelos Read/Write (si aplica). Versionado de esquemas.

---

## 10. PLANTILLAS DE SCAFFOLDING (Nx Generators)

Utilice los generadores Nx para automatizar la creación de la estructura según el perfil:

```bash
nx g domain billing --profile=core-domain
nx g domain notification --profile=service-domain
nx g domain pos --profile=ui-domain
```

Estos generadores crearán la estructura base, barrel files y configurarán las reglas de linting automáticamente.

---

## 11. PLAN DE ADOPCIÓN POR FASES

1.  **Fase 1: Alineación estructural (2 sprints):** Identificar perfil, crear carpetas faltantes, añadir `README`, `OWNERS` y `CHANGELOG`. Homologar nombres de UI.
2.  **Fase 2: Enforcement automático (2 sprints):** Configurar ESLint + dependency-cruiser. Migrar dominios para cumplir reglas de dependencia. Introducir versionado en `contracts`.
3.  **Fase 3: Hardening operativo (continuo):** Aumentar cobertura de contract tests y E2E. Implementar dashboards (SLO, errores). Refinar ACLs.

---

## 12. RECOMENDACIONES ESPECÍFICAS POR DOMINIO

| Dominio                                                                  | Prioridad | Acciones Clave                                                          |
| :----------------------------------------------------------------------- | :-------- | :---------------------------------------------------------------------- |
| **billing, fiscal, identity, treasury, accounting, inventory**           | **Alta**  | Perfil `core-domain`; implementar outbox, idempotencia, contract tests. |
| **purchasing, crm, projects, payroll, subscription, manufacturing, pos** | **Media** | Evaluar necesidad de UI/Presentación; definir ACLs con dominios core.   |
| **admin, bi, catalog, notification, scheduler, finops, fixed-assets**    | **Base**  | Perfil `service-domain`; simplificar estructura si no exponen APIs.     |

---

## 13. CONCLUSIÓN EJECUTIVA

Esta estructura v2.0 garantiza dominios:

1.  **Predecibles** para todos los equipos.
2.  **Seguros** frente a cambios y refactors.
3.  **Escalables** por región y tenant.
4.  **Auditables** y listos para operación enterprise.

**Próximos pasos inmediatos:**

1. Aprobar este estándar oficialmente.
2. Implementar los generadores Nx.
3. Iniciar la Fase 1 con los dominios de prioridad **Alta**.

---

**FIN DEL INFORME**
