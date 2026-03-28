# Guía de Migración de Billing a Estándar V2

## Resumen
Esta guía detalla los pasos seguidos para migrar el dominio de `billing` al nuevo estándar arquitectónico definido en `docs/architecture/GUIA_MIGRACION_DOMINIOS_V2.md`.

## Pasos Realizados
1. **Alineación estructural:** Se crearon las carpetas necesarias y se movieron los archivos a su nueva ubicación canónica.
2. **Definición de Perfil:** El dominio se clasificó como `core-domain`.
3. **Reestructuración de Capas:**
   - `domain`: Movidos agregados, entidades y servicios de dominio.
   - `application`: Organizado por casos de uso (commands/queries).
   - `contracts`: Definición de DTOs versionados.
   - `infrastructure`: Adaptadores y persistencia.
   - `presentation`: Controladores y resolvers.
