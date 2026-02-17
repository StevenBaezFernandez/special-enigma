# Informe Detallado: Estado de la Arquitectura de Microservicios en Virteex

**Fecha:** 24 de Mayo de 2025
**Autor:** Jules (Asistente de Ingeniería de Software)
**Estado Actual:** Monolito Híbrido Modular (Modular Monolith)

## 1. Resumen Ejecutivo

El proyecto Virteex se encuentra en una fase avanzada de transición desde un Monolito Modular hacia una Arquitectura de Microservicios completa. Actualmente opera bajo un modelo híbrido donde coexisten:
1.  Un **Monolito Central** (`virteex-api-gateway`) que gestiona la mayoría de los dominios críticos (Billing, Payroll, CRM, etc.).
2.  **Microservicios Satélite** (`virteex-catalog-service`, `virteex-auth-server`, `virteex-notification-service`) que han sido extraídos exitosamente.
3.  Una **Infraestructura Compartida** (Postgres, Kafka, Redis) que facilita la comunicación pero requiere disciplina estricta para mantener el aislamiento lógico.

La estrategia de migración parece seguir el patrón **Strangler Fig**, extrayendo dominios uno a uno mientras el monolito sigue sirviendo el resto de la funcionalidad.

---

## 2. Puntos Fuertes (Strengths)

### 2.1 Estructura de Código (Nx Monorepo)
- **Modularidad:** El uso de `libs/domains/*` es excelente. Cada dominio (ej. `billing`, `inventory`) es una librería independiente con límites claros (`Presentation`, `Application`, `Domain`, `Infrastructure`). Esto hace que la extracción a un microservicio sea casi trivial (mover la importación del módulo).
- **Tipado Fuerte:** TypeScript estricto en todo el repo asegura que los contratos de datos (DTOs) se respeten entre servicios.

### 2.2 Aislamiento de Datos (Database Isolation)
- **Script de Inicialización:** El script `infrastructure/docker/init-scripts/01-create-databases.sh` demuestra una intencionalidad clara de separar físicamente los datos. Crea bases de datos independientes (`virteex_catalog`, `virteex_inventory`, `virteex_identity`, `virteex_billing`) dentro del mismo contenedor Postgres.
- **Configuración Dinámica:** El servicio `virteex-catalog-service` tiene lógica para conectarse a su propia base de datos (`CATALOG_DB_NAME`) y **lanza un error en producción** si esta variable no está definida, evitando que se conecte accidentalmente a la BD del monolito.

### 2.3 Comunicación Asíncrona (Event-Driven)
- **Kafka Integration:** La infraestructura de mensajería (Kafka + Zookeeper) ya está desplegada y configurada en `libs/shared/infrastructure/kafka`. Los servicios utilizan `KafkaModule` para publicar y suscribirse a eventos de dominio, lo cual es vital para desacoplar procesos (ej. Facturación asíncrona).

---

## 3. Puntos Débiles (Weaknesses)

### 3.1 El "God Service" (`virteex-api-gateway`)
- **Sobrecarga de Responsabilidades:** Este servicio importa módulos de **13 dominios diferentes** (`Billing`, `Identity`, `Payroll`, `CRM`, etc.).
- **Riesgo Operativo:** Un error de memoria (Memory Leak) en el módulo de `Reporting` (BI) podría tumbar el módulo de `Identity` (Auth), afectando a toda la plataforma.
- **Escalado Ineficiente:** Para escalar el módulo de `Billing` (que tiene picos de carga a fin de mes), se debe replicar todo el contenedor del Gateway, desperdiciando recursos en módulos inactivos como `FixedAssets`.

### 3.2 Complejidad de Infraestructura Local
- **Recursos:** Levantar `virteex-api-gateway` + 5 microservicios + Kafka + Zookeeper + Postgres + Redis + Jaeger requiere una máquina de desarrollo potente. Esto puede ralentizar el ciclo de desarrollo local (DX).

### 3.3 Consistencia Eventual
- **Latencia de Datos:** Al mover `Catalog` a un servicio separado, `Billing` ya no puede hacer JOINs SQL con la tabla de productos. Debe confiar en la replicación de datos vía eventos o llamadas síncronas, lo cual introduce latencia y complejidad en el manejo de fallos.

---

## 4. Buenas Prácticas Observadas

1.  **Strict Boundaries:** El uso de `eslint` para prohibir importaciones circulares entre dominios.
2.  **Infrastructure as Code (IaC):** `docker-compose.yml` completo y reproducible.
3.  **Shared Libraries for Contracts:** Los DTOs y eventos se comparten como librerías, asegurando que el Productor (Monolito) y el Consumidor (Microservicio) hablen el mismo idioma.
4.  **Database per Service Pattern:** Aunque comparten el servidor físico (Postgres container), la separación lógica en bases de datos distintas es la práctica correcta para esta etapa.

---

## 5. Malas Prácticas / Riesgos Detectados

### 5.1 Riesgo de "Split Brain" en Identidad
- Se observa que existe `virteex-auth-server` (Microservicio) pero `virteex-api-gateway` también importa `IdentityPresentationModule`.
- **Riesgo:** Si ambos servicios intentan escribir en la tabla `users` o gestionar tokens, pueden surgir inconsistencias graves (race conditions). Se debe aclarar cuál es la fuente de la verdad para la autenticación.

### 5.2 Dependencia de Librerías Compartidas (Coupling)
- Si una librería compartida `libs/shared/util` cambia, obliga a recompilar y redesplegar **todos** los microservicios. Se debe tener cuidado con versionar estas librerías o estabilizar su API pública.

---

## 6. Recomendaciones

1.  **Priorizar la Extracción de `Billing`:** Dado que ya existe una base de datos `virteex_billing` creada por el script, el siguiente paso lógico es extraer `BillingPresentationModule` del Gateway hacia un nuevo `virteex-billing-service`.
2.  **Consolidar Identity:** Eliminar `IdentityPresentationModule` de `virteex-api-gateway` y delegar toda la autenticación al `virteex-auth-server` vía tokens JWT firmados, usando el Gateway solo como proxy (o validando el token en el Gateway sin acceso a DB).
3.  **Observabilidad Distribuida:** Asegurar que el `traceId` de Jaeger se propague correctamente a través de los mensajes de Kafka para poder rastrear una petición que empieza en HTTP y termina en un worker asíncrono.

## 7. Conclusión

Virteex está en el camino correcto. La arquitectura base es sólida y sigue los principios de Domain-Driven Design (DDD). El mayor reto a corto plazo es operativo: completar la extracción de dominios del Gateway para reducir su acoplamiento y riesgo de despliegue.
