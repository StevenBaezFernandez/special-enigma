# ADR 0001: Implementación del Patrón Outbox Transaccional

## Estado
Propuesto

## Contexto
El dominio de Contabilidad (accounting) es un `core-domain` que genera eventos críticos (ej. Asiento Contable registrado). Necesitamos garantizar que estos eventos se publiquen de forma fiable, incluso si el sistema de mensajería falla temporalmente.

## Decisión
Implementaremos el patrón **Transactional Outbox**.
- Los eventos se guardarán en una tabla de `outbox` dentro de la misma transacción que los cambios en el negocio.
- Un proceso separado (Relay) leerá de la tabla `outbox` y publicará en el bus de eventos.

## Consecuencias
- **Pros:** Garantía de entrega "at least once". Consistencia eventual entre la base de datos y el bus de eventos.
- **Contras:** Mayor complejidad. Necesidad de gestionar la idempotencia en los consumidores.
