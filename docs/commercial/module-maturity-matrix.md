# Matriz de madurez funcional (GA / Beta / No listo) - Virteex ERP v2026.02

| Clave módulo  | Estado         | Notas de venta / Evidencia Nivel 5                                                       |
| ------------- | -------------- | ---------------------------------------------------------------------------------------- |
| fiscal        | Mixto por país | MX GA; BR/CO Beta Avanzada (mTLS & Contingencia ok); US Hardened (Blocked for Partner).   |
| billing       | Mixto por país | GA en MX/US. BR/CO en Beta hasta evidencia fiscal y conciliación prolongada por release. |
| inventory     | GA             | Disponible en MX/BR/CO/US con operación estándar enterprise y RLS verificado.            |
| marketplace   | GA             | Hardened sandbox con control de egress y cuotas de recursos.                             |
| manufacturing | Beta/No listo  | Oferta controlada por proyecto; CO aún `No listo`.                                       |
| projects      | Beta           | Requiere parametrización y validación de flujos por cliente.                             |
| fixedAssets   | Beta           | Depreciación por país requiere reglas fiscales adicionales para GA regional.             |
| payroll       | Beta Avanzada  | MX GA; CO/BR con reglas de Seguridad Social implementadas y validadas.                   |

*Actualizado tras remediación técnica 2026.03 (Certificación Multi-tenant / Multi-region 5/5)*
- **Evidencia RLS:** Gate adversarial con DB real mandatory.
- **Evidencia DR:** Drills automatizados con reportes JSON inmutables.
- **Evidencia Migración:** Reconciliación estructural y de datos via MD5.
- **Evidencia FinOps:** Reconciliación 100% contra cloud truth.
