# ADR 0003: Tenancy Enforcement en Capa de Presentación

## Estado
Propuesto

## Contexto
Virteex es una plataforma multi-tenant. El dominio de Contabilidad debe garantizar la separación estricta de datos entre clientes.

## Decisión
Reforzaremos la resolución y validación de `tenantId` en la capa de **Presentación**:
- Cada controlador HTTP debe usar el decorador `@CurrentTenant()` para obtener el tenant del contexto de la petición.
- El `tenantId` se pasará explícitamente a los Casos de Uso en la capa de Aplicación.
- Los interceptores y guards de infraestructura se encargarán de inyectar este contexto en los logs y trazas.

## Consecuencias
- **Pros:** Seguridad por diseño. Facilita la auditoría.
- **Contras:** Sobrecarga ligera en cada petición. Acoplamiento del `tenantId` en las firmas de los casos de uso.
