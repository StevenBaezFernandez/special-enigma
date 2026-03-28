# ADR 0002: Estrategia de Versionado de Contratos

## Estado
Propuesto

## Contexto
Los contratos expuestos en `libs/domain/accounting/contracts` son consumidos por otros dominios y aplicaciones externas. Cambios rompedores (breaking changes) pueden afectar negativamente a la estabilidad del sistema.

## Decisión
Adoptaremos un **versionado semántico explícito por carpetas**:
- Las APIs HTTP se versionarán en `src/api/v1`, `src/api/v2`, etc.
- Los Eventos de Integración se versionarán en `src/events/v1`, `src/events/v2`, etc.
- Cualquier cambio rompedor requerirá una nueva versión mayor y el mantenimiento de la versión anterior durante un periodo de transición.

## Consecuencias
- **Pros:** Transparencia para los consumidores. Evolución segura del dominio.
- **Contras:** Duplicación parcial de código. Necesidad de mapeadores de compatibilidad.
