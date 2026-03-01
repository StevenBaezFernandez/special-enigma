# Readiness Gap Analysis - Virteex ERP

## 1. Contexto y Objetivos
Este documento detalla el estado real del repositorio Virteex ERP frente a los requerimientos de salida comercial (GA) para LatAm y EE. UU.

## 2. Estado Real vs Informe de Brechas

### 2.1 Fiscalidad
| Región | Estado Reportado | Hallazgo en Código | Riesgo |
| :--- | :--- | :--- | :--- |
| **México (SAT)** | 100% (GA) | Confirmado. El adaptador `SatFiscalAdapter` parece completo. | Bajo. |
| **Colombia (DIAN)** | 60% | `DianFiscalAdapter` tiene firma XML básica pero NO cumple XAdES-EPES real (falta `X509Data` completo y propiedades firmadas). Faltan métodos sincrónicos. | **Crítico**. Bloquea cumplimiento normativo. |
| **Brasil (SEFAZ)** | 50% | `SefazFiscalAdapter` es un stub avanzado. Falta mTLS real y gestión de certificados A1/A3. | **Crítico**. Bloquea transmisión real. |
| **EE. UU.** | 40% | `UsTaxPartnerFiscalAdapter` tiene endpoints `/sandbox` hardcodeados. | **Alto**. Impide uso productivo. |

### 2.2 Plataforma y Seguridad
- **Multi-tenancy**: Existe soporte para Shared y Schema, pero el orquestador para `database-per-tenant` es incipiente o inexistente en `kernel-tenant`.
- **Seguridad**: El pipeline de CI/CD tiene pasos de SBOM y firma, pero la política de admisión de plugins en `platform/policies` no está endurecida con SAST/DAST.
- **RLS**: Falta instrumentación específica para medir latencia de políticas RLS en tiempo real.

### 2.3 Contabilidad y Otros
- **Contabilidad**: Faltan casos de uso para Balance General, P&L y cierre fiscal en `accounting-application`.
- **Manufactura/Activos**: Los módulos existen como esqueleto pero carecen de lógica de negocio (depreciación, MRP).

## 3. Quick Wins
1. Parametrizar endpoints de EE. UU.
2. Endurecer el workflow de CI/CD para SBOM.
3. Implementar placeholders de métricas RLS en el middleware de telemetría.

## 4. Bloqueantes para Salida Comercial
1. Falta de firma XAdES-EPES válida para Colombia.
2. Inexistencia de transporte mTLS seguro para Brasil.
3. Ausencia de reportes financieros básicos para clientes Enterprise.

## 5. Orden de Ejecución Recomendado
1. **P0**: Fiscalidad (CO, BR, US) + Seguridad Supply Chain.
2. **P1**: Contabilidad Enterprise + Orquestación Multi-tenant.
3. **P2**: Manufactura y Activos Fijos.
