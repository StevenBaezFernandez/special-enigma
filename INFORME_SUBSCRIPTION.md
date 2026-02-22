# Informe de Auditoría del Módulo de Subscription

**Fecha:** 24 de Mayo de 2025
**Auditor:** Jules (AI Software Engineer)
**Alcance:** Frontend (`apps/frontend/virteex-web`, `libs/domains/billing/ui`) y Backend (`libs/domains/subscription`)

---

## 1. Resumen Ejecutivo

El módulo de suscripción presenta una base arquitectónica sólida siguiendo principios de Domain-Driven Design (DDD) y utilizando tecnologías modernas (NestJS en backend, Angular con Signals en frontend). Sin embargo, la implementación actual contiene **vulnerabilidades de seguridad críticas**, lógica de negocio incompleta (especialmente en actualizaciones de planes) y carencias en el manejo de robustez y errores que impiden que esté listo para producción.

**Calificación General:** 5/10
**Nivel de Completitud:** 60%

---

## 2. Análisis Detallado

### 🛡️ Seguridad (Calificación: 4/10)

*   **Vulnerabilidad Crítica de Autorización:** El controlador `SubscriptionController` no tiene `Guard`s (`@UseGuards`) aplicados a nivel de clase o método. Cualquiera puede acceder a los endpoints si conoce la URL.
*   **Suplantación de Tenant:** El método `create` permite pasar un `tenantId` en el cuerpo (`dto.tenantId`) que sobrescribe el `tenantId` obtenido del decorador `@CurrentTenant()`. Esto permite a un usuario malintencionado crear suscripciones para otros tenants.
    *   *Código afectado:* `dto.tenantId = tenantId || dto.tenantId || 'default-tenant';`
*   **Manejo de Secretos:**
    *   El adaptador de Stripe (`StripeSubscriptionAdapter`) utiliza un valor por defecto (`'sk_test_placeholder'`) si no encuentra la variable de entorno. Esto es peligroso si se despliega sin configuración.
    *   Las variables `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` y `STRIPE_WEBHOOK_SECRET` no están documentadas en `.env.example`.
*   **Validación de Webhooks:** El controlador de webhooks tiene una ruta de escape insegura que omite la verificación de firma si no hay secreto configurado (`if (!this.endpointSecret) ...`), lo cual no debería permitirse en entornos productivos.

### ⚙️ Robustez (Calificación: 5/10)

*   **Lógica de Actualización Destructiva:** El caso de uso `CreateSubscriptionUseCase` cancela la suscripción existente (`cancelSubscription`) antes de crear una nueva al cambiar de plan. Esto es incorrecto para actualizaciones (upgrades/downgrades), ya que:
    *   Se pierde el historial de facturación.
    *   No se maneja el prorrateo correctamente (Stripe lo hace automáticamente si se usa `update`, pero aquí se destruye y crea de nuevo).
    *   Puede generar cobros duplicados o ciclos de facturación extraños.
*   **Manejo de Errores:**
    *   El frontend (`BillingPage`) solo hace `console.error` en caso de fallos. No hay feedback visual para el usuario (toasts, alertas).
    *   El backend no maneja casos como `invoice.payment_failed` en los webhooks, lo que significa que el sistema no reaccionará si un pago recurrente falla (el usuario seguirá teniendo acceso).
*   **Dependencia de Datos:** El frontend asume que `subscription()` siempre traerá un `stripeCustomerId`. Si un usuario nuevo entra a la página de facturación sin haber pasado por un flujo de creación de cliente previo, las acciones fallarán silenciosamente o con errores de consola.

### 🏗️ Arquitectura y Buenas Prácticas (Calificación: 8/10)

*   **Backend (NestJS + DDD):** La estructura es excelente. Separación clara entre `Infrastructure` (Adapter, Repository), `Application` (Use Cases), `Domain` (Entities) y `Presentation` (Controllers).
*   **Frontend (Angular):** Uso moderno de **Signals** (`toSignal`, `signal`, `effect`) y componentes `standalone`. La estrategia `OnPush` mejora el rendimiento.
*   **Código Limpio:** El código es legible, tipado (aunque con algunos `any` en las respuestas de Stripe) y modular.

### 📈 Escalabilidad (Calificación: 6/10)

*   **Base de Datos:** Uso de MikroORM con entidades bien definidas.
*   **Desacoplamiento:** El uso de puertos y adaptadores (`SubscriptionGateway`) permite cambiar Stripe por otro proveedor (ej. PayPal) con relativo poco esfuerzo.
*   **Limitaciones:** La lógica de "cancelar y recrear" suscripciones no escalará bien con reglas de negocio complejas (descuentos, tiers, asientos).

### 🚀 Competitividad (Calificación: 4/10)

Para ser un módulo competitivo en el mercado SaaS actual, faltan características clave:
*   **Manejo de Prorrateo:** Vital para upgrades a mitad de mes.
*   **Facturación por Uso (Metered Billing):** Aunque hay interfaces de `UsageItem`, no se ve lógica de reporte de uso a Stripe.
*   **Gestión de Métodos de Pago:** No hay UI ni lógica clara para actualizar tarjetas vencidas o cambiar método de pago por defecto desde la configuración.
*   **Periodos de Prueba:** La lógica de `trial` es muy básica y mapea estados incorrectamente (`incomplete` -> `TRIAL`).
*   **Facturas (Invoices):** No hay visualización ni descarga de facturas en PDF en el frontend (solo una lista básica en `PaymentHistory`).

### 🔧 Infraestructura (Calificación: 6/10)

*   **Dependencias:** Versiones de librerías modernas (`stripe` v20+, `nestjs` v11).
*   **Configuración:** Falta documentación de variables de entorno críticas en `.env.example`.

---

## 3. Plan de Acción Recomendado (Roadmap to 100%)

Para llevar este módulo al 100% y listo para producción, se recomiendan los siguientes pasos prioritarios:

1.  **Seguridad Inmediata:**
    *   Implementar `Guards` de autenticación y roles en `SubscriptionController`.
    *   Eliminar la posibilidad de inyectar `tenantId` desde el body en los controladores; usar estrictamente el token de usuario.
    *   Forzar la verificación de firma de Webhooks en producción.

2.  **Refactorización de Lógica de Negocio:**
    *   Reescribir `CreateSubscriptionUseCase` para distinguir entre *creación* y *actualización*. Usar `stripe.subscriptions.update` para cambios de plan.
    *   Implementar manejo correcto de estados de suscripción (`past_due`, `unpaid`) en los webhooks para bloquear acceso.

3.  **Mejoras en Frontend:**
    *   Implementar manejo de errores visual (Notificaciones/Toasts).
    *   Agregar gestión de métodos de pago (Agregar/Eliminar tarjeta).
    *   Mostrar lista de facturas con enlace de descarga.

4.  **DevOps & Config:**
    *   Actualizar `.env.example` con las claves de Stripe.
    *   Crear seeders o scripts de inicialización para planes de suscripción en la BD local.
