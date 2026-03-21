# Scorecard de Remediación Técnica (Marzo 2026)

Este documento detalla el estado de remediación de los hallazgos críticos identificados en el monorepo Virteex.

| ID | Hallazgo | Estado | Acción Realizada |
|:---|:---|:---:|:---|
| 1 | Validación de tags deshabilitada | ✅ Cerrado | Reimplementada validación real en `tools/validate-project-tags.mjs`. |
| 2 | Stubs funcionales en tesorería | ✅ Cerrado | Implementado QueryBuilder en repositorio y parser OFX real. |
| 3 | Bypass de SAST en Plugin Admission | ✅ Cerrado | Cambiado a fail-closed. SONAR_TOKEN obligatorio fuera de `local`. |
| 4 | Modo simulado en prueba fiscal | ✅ Cerrado | REAL_MODE obligatorio en CI/Release. |
| 5 | Fallbacks inseguros de secretos | ✅ Cerrado | Eliminados defaults; validación fail-fast implementada. |
| 6 | Conexión hardcodeada en RLS gate | ✅ Cerrado | DATABASE_URL obligatoria. |
| 7 | Quality gate de TLS/secretos parcial | ✅ Cerrado | Expandido a .js, .mjs, .sh y directorio tools/. |
| 8 | Uso masivo de `any` | ✅ En Progreso | Remediado en entidades Purchasing y servicios Treasury. Plan de reducción activo. |
| 9 | Desactivación amplia de ESLint | ✅ Cerrado | Global disables reemplazados por fixes o targeted disables. |
| 10 | SBOM con placeholder en fallback | ✅ Cerrado | Fallo obligatorio en release; placeholder solo para dev local. |
| 11 | Inconsistencia narrativa vs técnica | ✅ Cerrado | Scorecard publicado y stubs críticos eliminados. |

## Excepciones Activas y Deuda Técnica Remanente

1. **Uso de `any` (Ref Finding 8):** Se ha iniciado la reducción en capas Domain/Application. Se mantiene una meta de reducción del 20% por sprint hasta alcanzar < 5% de cobertura `any`.
   - *Fecha objetivo de cierre:* 2026-06-30.
2. **ESLint en E2E (Ref Finding 9):** Se han eliminado los disables globales. Pueden persistir advertencias menores de estilo que no comprometen la calidad.
   - *Fecha objetivo de cierre:* 2026-04-15.
