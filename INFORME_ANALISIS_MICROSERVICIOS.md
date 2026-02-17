# Informe de Análisis de Migración a Microservicios - Proyecto Virteex

**Fecha:** 24 de Mayo de 2025
**Autor:** Jules (Asistente de Ingeniería de Software)

## 1. Resumen Ejecutivo

El proyecto Virteex se encuentra actualmente en una etapa de transición hacia una arquitectura de microservicios, operando bajo un modelo de **Monolito Híbrido Modular**. Si bien la estructura del código (Nx Monorepo) y la separación lógica de dominios son excelentes, la implementación en tiempo de ejecución (Runtime) sigue estando fuertemente acoplada en el servicio `virteex-api-gateway`.

Existen microservicios satélite (`virteex-catalog-service`, `virteex-notification-service`, `virteex-fiscal-connector`), pero el núcleo del negocio (Billing, Identity, Inventory, etc.) reside monolíticamente en el Gateway.

---

## 2. Análisis de Arquitectura Actual

### Topología Física
- **Core Monolítico:** `virteex-api-gateway` (Puerto 3000/API REST). Contiene la lógica de todos los dominios principales.
- **Microservicios Satélite:**
  - `virteex-catalog-service` (GraphQL Subgraph): Actualmente una estructura base con resolvers hardcodeados, sin conexión real a dominio.
  - `virteex-notification-service`: Worker asíncrono conectado a Kafka/Redis.
  - `virteex-fiscal-connector`: Gateway de facturación.
- **Base de Datos:** Instancia única de Postgres (`virteex_core`) compartida por todos los servicios.

### Patrones de Comunicación
- **Interna (Monolito):** Llamadas directas a librerías (`libs/domains/*`). Acoplamiento fuerte en tiempo de compilación.
- **Externa (Microservicios):**
  - **Síncrona:** GraphQL Federation (Apollo) para lectura de catálogos (en progreso).
  - **Asíncrona:** Kafka y Redis (BullMQ) para eventos de dominio y tareas en segundo plano.

---

## 3. Puntos Fuertes (Strengths)

1.  **Estructura Nx Monorepo:**
    - La organización del código es de clase mundial. El uso de librerías en `libs/domains` facilita enormemente la extracción futura de servicios.
    - **Clean Architecture:** La separación en capas (Presentation, Application, Domain, Infrastructure) dentro de cada librería es evidente y correcta.

2.  **Aislamiento de Dominios (Bounded Contexts):**
    - Los dominios (`billing`, `inventory`, `identity`) ya están separados lógicamente. No hay "código espagueti" mezclando facturación con inventario, lo cual es el obstáculo más difícil en migraciones.

3.  **Infraestructura Preparada:**
    - `docker-compose.yml` ya incluye Kafka, Zookeeper, Redis y Jaeger. La fontanería para microservicios está lista.

4.  **Estándares de Código:**
    - Uso consistente de DTOs, Validaciones, y Patrón Repositorio.
    - Configuración de ESLint para prevenir importaciones circulares o indebidas entre dominios.

---

## 4. Puntos Débiles (Weaknesses)

1.  **Base de Datos Compartida (Shared Database Integration):**
    - Todos los servicios apuntan a la misma instancia física y lógica de Postgres. Esto crea un punto único de fallo y acoplamiento de datos.
    - Si dos servicios modifican la misma tabla, se rompe la autonomía.

2.  **"God Service" (Gateway Monolítico):**
    - `virteex-api-gateway` importa directamente los módulos de presentación de todos los dominios. Esto significa que para escalar el módulo de "Billing", debes escalar todo el Gateway.
    - Cualquier fallo en un módulo (ej. memory leak en Inventory) puede tumbar toda la API, incluyendo Auth y Billing.

3.  **Microservicios "Cascarón":**
    - `virteex-catalog-service` existe pero su implementación actual es trivial (strings hardcodeados). No está consumiendo la librería de dominio de catálogo real, lo que sugiere una duplicación de lógica o una migración incompleta.

4.  **Complejidad Operativa:**
    - Gestionar trazas distribuidas (Jaeger), logs centralizados y consistencia eventual es exponencialmente más complejo que en un monolito, y el equipo debe estar preparado para ello.

---

## 5. Buenas Prácticas Observadas

- **Librerías Compartidas (Shared Libraries):** Uso correcto de librerías para DTOs y utilidades (`libs/shared`), evitando duplicación de código.
- **Abstracción de Infraestructura:** Los dominios definen interfaces de repositorio (`Repository Port`) y la infraestructura la implementa. Esto permite cambiar de Postgres a Mongo o HTTP sin tocar la lógica de negocio.
- **Uso de Eventos de Dominio:** El sistema ya utiliza `EventEmitter` y Kafka para desacoplar procesos (ej. `UserInvitedEvent`), lo cual es fundamental para microservicios.

---

## 6. Malas Prácticas / Riesgos Detectados

- **Acoplamiento de Despliegue:** Al tener todo en el Gateway, un cambio pequeño en un reporte requiere redesplegar toda la plataforma.
- **Falsos Microservicios (Distributed Monolith):** Existe el riesgo de que al extraer un servicio (ej. Catalog), este siga conectándose a las mismas tablas que el Gateway, creando un "Monolito Distribuido" (lo peor de ambos mundos: latencia de red + acoplamiento de datos).
- **Gestión de Secretos:** Aunque ha mejorado, se debe asegurar que cada microservicio tenga sus propias credenciales de base de datos y no compartan el usuario `virteex` root.

---

## 7. Recomendaciones para la Migración

### Estrategia: Strangler Fig Pattern (Higuera Estranguladora)
No reescribir todo de golpe. Migrar dominio por dominio.

1.  **Paso 1: Identificar un Dominio Candidato.**
    - `Catalog` es ideal por ser de mucha lectura y poca escritura, y tener pocas dependencias.
    - `Notification` ya está fuera, lo cual es excelente.

2.  **Paso 2: Aislamiento de Datos (CRÍTICO).**
    - Antes de mover el código, mueve los datos. Crea un esquema separado (ej. `schema: catalog`) en Postgres.
    - Asegura que **SOLO** el usuario de BD del servicio de catálogo tenga acceso a ese esquema.

3.  **Paso 3: Extracción de Lógica.**
    - Configurar `virteex-catalog-service` para importar `libs/domains/catalog`.
    - Eliminar la importación de `CatalogPresentationModule` en `virteex-api-gateway`.
    - El Gateway ahora debe delegar las llamadas a `virteex-catalog-service` (vía HTTP/GraphQL o gRPC), actuando como un Proxy reverso.

4.  **Paso 4: Comunicación Asíncrona.**
    - Si `Billing` necesita datos de `Catalog`, no debe consultar la BD de catálogo. Debe:
      - O bien llamar a la API de Catálogo (síncrono).
      - O bien suscribirse a eventos de Kafka de cambios en catálogo y mantener una caché local (asíncrono/eventual).

### Arquitectura Objetivo Sugerida

| Componente | Rol | Responsabilidad |
| :--- | :--- | :--- |
| **Apollo Gateway** | API Gateway | Enrutamiento, Autenticación, Rate Limiting. |
| **Virteex Monolith (Legacy)** | Backend | Mantiene dominios complejos aún no migrados (Core). |
| **Auth Service** | Identity Provider | Gestión de Tokens (OAuth2/OIDC). |
| **Catalog Service** | Microservicio | Gestión de Productos, Precios, Taxonomías. |
| **Fiscal Service** | Microservicio | Timbrado, Facturación, Conexión con PACs. |
| **Kafka** | Event Bus | Sincronización de datos y disparador de procesos. |

---

## Conclusión

El proyecto tiene una base técnica **sobresaliente** para soportar microservicios. El trabajo duro de modularización ya está hecho. El desafío ahora es puramente de infraestructura y operación: separar las bases de datos y orquestar los despliegues independientes. Se recomienda proceder con cautela, extrayendo servicios "borde" (Edge Services) primero antes de tocar el núcleo transaccional.
