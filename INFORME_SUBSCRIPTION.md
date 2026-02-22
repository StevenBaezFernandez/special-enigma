# Informe de Auditoría del Módulo de Suscripciones (Subscription & Billing)

**Fecha:** 2025-05-24
**Autor:** Jules (AI Software Engineer)
**Alcance:** Frontend (Angular) y Backend (NestJS/MikroORM)

## 1. Resumen Ejecutivo

El módulo de suscripciones se encuentra en un estado **incipiente e incompleto**. Si bien la arquitectura base (Modular Monolith con DDD) es sólida, la implementación actual es superficial. El backend simula la creación de suscripciones sin integrarse realmente con una pasarela de pagos (Stripe) para cobros recurrentes, y el frontend intenta comunicarse con endpoints que no existen.

**Estado General:** 🔴 Crítico / Inutilizable en producción.
**Porcentaje de Avance Estimado:** ~25%

---

## 2. Análisis Detallado

### 2.1 Arquitectura y Diseño
El proyecto sigue una arquitectura limpia (Clean Architecture) con separación clara de capas:
-   `Domain`: Entidades puras (`Subscription`).
-   `Application`: Casos de uso (`CreateSubscriptionUseCase`).
-   `Infrastructure`: Adaptadores (Repositorios).
-   `Presentation`: Controladores (`SubscriptionController`).

**Puntos Fuertes:**
-   La estructura de carpetas y módulos es correcta y escalable.
-   Uso de MikroORM para persistencia.

**Puntos Débiles:**
-   Fragmentación confusa entre los dominios `billing` y `subscription`. La lógica de pagos está en `billing`, pero las suscripciones en `subscription`. El frontend de suscripciones (`BillingPage`) vive en `billing`, lo cual rompe la cohesión del dominio `subscription`.

### 2.2 Backend (Lógica y Seguridad)
El backend presenta deficiencias críticas para un sistema de cobros real:

1.  **Falsa Implementación de Suscripciones:**
    -   El caso de uso `CreateSubscriptionUseCase` simplemente guarda un registro en la base de datos local.
    -   **NO** llama a la API de Stripe para crear una suscripción (`stripe.subscriptions.create`).
    -   Calcula la fecha de renovación (`nextBillingDate`) manualmente sumando 1 mes o 1 año, sin tener en cuenta la lógica de facturación real del proveedor.

2.  **Falta de Webhooks:**
    -   No se encontró evidencia de manejo de Webhooks de Stripe (`stripe-webhook.controller` o similar).
    -   Sin webhooks, el sistema no se enterará si un pago falla, si una tarjeta expira o si el usuario cancela la suscripción desde el panel de Stripe.

3.  **Seguridad (Vulnerabilidades):**
    -   **IDOR (Insecure Direct Object References):** Los controladores aceptan `tenantId` como query param sin validar si el usuario autenticado pertenece a ese tenant (e.g., `@Query('tenantId') tenantId: string`).
    -   **Validación:** No se observaron validaciones robustas (e.g., `class-validator`) en los DTOs para evitar inyección de datos inválidos.

4.  **Endpoints Faltantes:**
    -   El frontend llama a `/billing/checkout` y `/billing/portal`, pero estos endpoints **no existen** en `BillingController` ni en `SubscriptionController`.

### 2.3 Frontend (UX e Integración)
La interfaz de usuario está ubicada incorrectamente en `libs/domains/billing/ui` y presenta los siguientes problemas:

1.  **Funcionalidad Rota:**
    -   El método `upgradePlan` llama a `billingService.createCheckoutSession`, el cual apunta a una ruta inexistente del backend.
    -   El método `manageSubscription` llama a `billingService.createPortalSession`, también inexistente.

2.  **Manejo de Estado:**
    -   Depende de propiedades como `stripeCustomerId` en la entidad `Subscription`, pero dicha entidad en el backend no tiene ese campo definido en su esquema (`subscription.entity.ts`).

---

## 3. Calificación por Puntos

| Criterio | Calificación (1-10) | Justificación |
| :--- | :---: | :--- |
| **Seguridad** | 3/10 | Falta validación de acceso por Tenant (IDOR). No hay verificación de firmas de Webhooks (porque no existen). |
| **Robustez** | 2/10 | El sistema se desincronizará inmediatamente de la realidad (Stripe) al no tener integración real ni webhooks. |
| **Buenas Prácticas** | 8/10 | La estructura del código (DDD, Nx, Clean Arch) es excelente. El problema es la *falta* de código, no la calidad del código existente. |
| **Escalabilidad** | 7/10 | La arquitectura base permite escalar bien, pero la falta de manejo de eventos asíncronos (Webhooks) sería un cuello de botella operativo. |
| **Competitividad** | 1/10 | Faltan features estándar: Trials, Cupones, Prorrateo, Manejo de Impuestos, Facturas en PDF, Cancelación, Reactivación. |
| **Infraestructura** | 6/10 | El uso de NestJS y Angular en un Monorepo Nx es moderno y sólido. La integración con Stripe es obsoleta (API de Charges vs PaymentIntents/Subscriptions). |
| **Arquitectura** | 8/10 | Bien planteada, pero mal ejecutada en la integración entre módulos (`billing` vs `subscription`). |

---

## 4. Estado de Finalización (Gap Analysis)

**Falta para estar 100% terminado:**

1.  **Integración Real con Stripe (Backend):**
    -   Implementar `stripe.subscriptions.create` en `CreateSubscriptionUseCase`.
    -   Implementar `stripe.billingPortal.sessions.create` para el portal de cliente.
    -   Migrar de `stripe.charges` (Legacy) a `stripe.paymentIntents` o Stripe Checkout.

2.  **Manejo de Webhooks (Backend - Crítico):**
    -   Crear un endpoint para recibir eventos de Stripe (`invoice.payment_succeeded`, `customer.subscription.deleted`, etc.).
    -   Sincronizar el estado local (`SubscriptionStatus`) con los eventos de Stripe.

3.  **Corrección del Modelo de Datos:**
    -   Agregar campos `stripeSubscriptionId`, `stripeCustomerId`, `currentPeriodEnd` a la entidad `Subscription`.
    -   Relacionar `Subscription` con `User` o `Tenant` de forma segura.

4.  **Frontend:**
    -   Mover la lógica de suscripción a `libs/domains/subscription/ui`.
    -   Implementar manejo de errores real (no solo `console.error`).
    -   Mostrar estado real de la suscripción (fecha de renovación, método de pago).

5.  **Seguridad:**
    -   Implementar Guards (`@UseGuards(AuthGuard)`) y Decoradores de Usuario (`@CurrentUser()`) para evitar enviar `tenantId` manualmente desde el frontend.

---

## 5. Conclusión

El módulo es un **esqueleto arquitectónico** más que una funcionalidad terminada. Se ha preparado el terreno (Estructura de carpetas, Clases base) pero la lógica de negocio vital para cobrar dinero y gestionar suscripciones está ausente o simulada. Se requiere un esfuerzo significativo de desarrollo backend para hacerlo funcional.
