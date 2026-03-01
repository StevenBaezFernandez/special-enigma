# Virteex Monorepo Map

Este documento proporciona una visión clara de la estructura del monorepo y la ubicación de los diferentes artefactos arquitectónicos siguiendo los principios de Clean Architecture y DDD.

## Estructura de Directorios Principal

```text
.
├── apps/               # Aplicaciones (Composition Roots)
│   ├── api/            # Servicios Backend (NestJS)
│   ├── web/            # Aplicaciones Web (Angular)
│   ├── mobile/         # Apps Móviles (Ionic/Capacitor)
│   ├── desktop/        # Apps Desktop (Electron/Tauri)
│   └── worker/         # Background Workers
├── libs/               # Librerías Reutilizables (Core Logic)
│   ├── domain/         # Lógica de Negocio por Dominio
│   ├── kernel/         # Utilidades Core y Cross-cutting Concerns
│   ├── platform/       # Infraestructura de Plataforma (IaC, CI/CD)
│   └── shared/         # Utilidades y UI compartidas
├── platform/           # Configuraciones Globales de Infra (K8s, Helm)
├── tools/              # Scripts, Generators y Calidad
└── docs/               # Documentación Técnica
```

## Anatomía de un Dominio (`libs/domain/<dominio>`)

Cada dominio de negocio se divide en capas siguiendo Clean Architecture:

1. **`domain/`**: El corazón del dominio.
   - **Contenido**: Entidades, Value Objects, Domain Services, Repositorios (Interfaces), Eventos.
   - **Regla de Oro**: **Puro TypeScript**. Cero dependencia de frameworks (NestJS, MikroORM).
2. **`application/`**: Casos de uso y orquestación.
   - **Contenido**: Use Cases, DTOs de entrada, Ports para adaptadores externos.
   - **Regla de Oro**: No debe depender de la capa de transporte (HTTP/GraphQL). Usa `DomainException`.
3. **`infrastructure/`**: Implementaciones técnicas.
   - **Contenido**: Repositorios (MikroORM), Adaptadores API externos, Mappings de Base de Datos.
4. **`presentation/`**: Adaptadores de entrada.
   - **Contenido**: NestJS Controllers, GraphQL Resolvers, DTOs de salida, Presenters.
5. **`contracts/`**: Definiciones compartidas.
   - **Contenido**: Interfaces y DTOs compartidos entre el backend y otros consumidores.

## Dónde crear cada artefacto

| Artefacto | Ubicación Recomendada |
| :--- | :--- |
| **Entidad de Dominio** | `libs/domain/<dominio>/domain/src/lib/entities/` |
| **Caso de Uso** | `libs/domain/<dominio>/application/src/lib/use-cases/` |
| **Controller / Resolver** | `libs/domain/<dominio>/presentation/src/lib/` |
| **Repositorio (Interface)** | `libs/domain/<dominio>/domain/src/lib/repositories/` |
| **Repositorio (Impl)** | `libs/domain/<dominio>/infrastructure/src/lib/repositories/` |
| **Mapping ORM** | `libs/domain/<dominio>/infrastructure/src/lib/persistence/` |
| **Utilidad Transversal** | `libs/shared/util/` o `libs/kernel/` |

## Gobernanza Automática

El repositorio utiliza un script de validación arquitectónica que corre en cada commit:

```bash
npm run arch:check
```

Este script asegura que:
- No haya filtraciones de frameworks en la capa `domain`.
- No haya excepciones HTTP en la capa `application`.
- Los App Shells no dupliquen artefactos de presentación.
- Se respeten las etiquetas de `scope` de Nx.
