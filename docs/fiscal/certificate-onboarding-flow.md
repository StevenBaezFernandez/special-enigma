# Onboarding fiscal de certificados digitales

## Flujo seguro mínimo

1. Carga del certificado por canal autenticado (MFA + sesión corta).
2. Validación inmediata:
   - vigencia (notBefore/notAfter),
   - cadena de confianza,
   - RFC/CNPJ/NIT esperado del tenant.
3. Almacenamiento cifrado (KMS/Vault), nunca en texto plano.
4. Registro auditable de carga/rotación/revocación.
5. Bloqueo de emisión fiscal cuando el certificado no esté vigente.

## Controles operativos

- Rotación programada y alertas de expiración (`T-30`, `T-7`, `T-1`).
- Runbook de renovación asistida con rollback.
