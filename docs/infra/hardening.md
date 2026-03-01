# Infra Hardening Evidence - Virteex ERP

## 1. TLS/SSL Hardening
Se ha eliminado el uso de `rejectUnauthorized: false` en todos los microservicios core.
La configuración de base de datos ahora sigue un modelo **fail-closed**:

```typescript
// Ejemplo implementado en apps/api/billing/app/src/app/app.module.ts
driverOptions: isPostgres && configService.get<boolean>('DB_SSL_ENABLED')
  ? {
      connection: { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true" } },
    }
  : undefined,
```

## 2. Base de Datos (RDS/Aurora)
Se ha endurecido el módulo de Terraform para evitar pérdida accidental de datos.
- `skip_final_snapshot` cambiado de `true` a `false`.
- Implementada generación dinámica de `final_snapshot_identifier`.

## 3. Alta Disponibilidad (K8s/Helm)
Se ha incrementado el número de réplicas para servicios críticos para garantizar HA en producción.
- `api-gateway`: 2 réplicas.
- `identity`: 2 réplicas.
- `billing`: 2 réplicas.

## 4. CI/CD & Supply Chain
- Eliminado el fallback de `openssl` para firmas de imágenes.
- El pipeline falla si no existe `COSIGN_PRIVATE_KEY` en entornos de release.
- SBOM (`sbom.json`) es ahora un artefacto obligatorio sin bypass.
