# Guía de Migración de Dominio: Admin

Esta guía detalla el proceso específico de migración del dominio de `admin` a la estructura canónica v2.0.

## Perfil del Dominio
- **Perfil:** `ui-domain`

## Fases de la Migración

### Fase 1: Alineación Estructural
- Inicialización de metadatos del root (README, OWNERS, CHANGELOG).
- Creación de la estructura de carpetas en `docs/`.

### Fase 2: Restructuración por Capas
1. **Domain:** Movimiento de entidades y puertos.
2. **Application:** Organización de casos de uso y servicios.
3. **Contracts:** Creación de DTOs versionados.
4. **Infrastructure:** Adaptadores técnicos y persistencia.
5. **Presentation:** Controladores y ruteo.
6. **UI:** Componentes de interfaz y estado.

### Fase 3: Testing y Verificación
- Creación de suites transversales en `testing/`.
- Actualización de importaciones y validación de reglas de dependencia.
