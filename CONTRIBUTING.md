# Contributing to Virteex ERP

Este documento proporciona pautas para contribuir al monorepo manteniendo la integridad de la arquitectura y la calidad del código.

## Proceso de Desarrollo

1.  **Exploración**: Consulta el [Monorepo Map](docs/MONOREPO_MAP.md) para entender dónde debe vivir cada parte de tu código.
2.  **Límites Arquitectónicos**: No rompas las capas. La capa `domain` es sagrada y no debe depender de frameworks externos. La capa `application` es agnóstica al transporte.
3.  **App Shells**: Mantén las apps en `apps/*` lo más pequeñas posible. Si tu lógica de presentación puede ser compartida o es lógica de negocio pura, debe vivir en una librería.

## Antes de enviar un Pull Request

Ejecuta estas validaciones locales:

- `npm run arch:check`: Asegura que tu código no rompe los límites arquitectónicos.
- `npm run quality:lint`: Valida el estilo y reglas estáticas de código.
- `npm run test:unit`: Ejecuta las pruebas unitarias.
- `npm run readiness:check`: Verifica que el código está listo para producción (secretos, placeholders, etc.).

## Taxonomía de tags Nx

Utilizamos etiquetas de proyecto (`tags` en `project.json`) para imponer gobernanza:

- `scope:<dominio>`: Define a qué dominio pertenece la librería o app (ej. `scope:catalog`).
- `layer:<capa>`: Define la capa arquitectónica (`domain`, `application`, `infrastructure`, `presentation`, `contracts`, `app`).
- `platform:<plataforma>`: Define la plataforma objetivo (`api`, `web`, `mobile`, `desktop`, `agnostic`).
- `criticality:<nivel>`: Define la criticidad del componente (`high`, `medium`, `low`).

## Reglas y Convenciones

- No introduzcas proveedores `mock` o `simulated` en rutas de código productivo.
- No uses secretos hardcoded ni placeholders en archivos de configuración.
- Si realizas un `breaking change`, es obligatorio documentar el proceso de migración en la descripción del PR.
