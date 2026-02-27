# Mobile Offline Security

## Estado implementado
- En dispositivos nativos se exige SQLite con modo `secret`.
- La clave de cifrado local se guarda en `SecureStorageService` y se inicializa de forma segura.
- Si falta secreto en producción móvil, el arranque falla (fail-fast).

## Hooks operativos recomendados
- Remote wipe: invalidar sesión + borrar secretos y DB local.
- MDM compliance: bloquear acceso cuando el dispositivo no cumple políticas.
- Rotación de secreto local por evento de seguridad de tenant.

## Limitaciones actuales
- En web (PWA) se utiliza `jeep-sqlite`; no ofrece el mismo nivel de cifrado que nativo.
