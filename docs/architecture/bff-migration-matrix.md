# BFF Migration Matrix

| Legacy Endpoint (Prefix) | Destination BFF | Responsibility | Status |
|-------------------------|-----------------|----------------|--------|
| `/api/auth/*` | `bff-portal` | Authentication & Identity (Shared) | Pending |
| `/api/users/*` | `bff-portal` | User Management (Shared) | Pending |
| `/api/inventory/*` | `bff-wms` / `bff-portal` | Inventory Management | Pending |
| `/api/accounting/*` | `bff-portal` | Financials | Direct (Current) |
| `/api/billing/*` | `bff-portal` | Invoicing & Billing | Pending |
| `/api/crm/*` | `bff-portal` | Customer Relationship | Pending |
| `/api/fiscal/*` | `bff-portal` | Tax & Compliance | Pending |
| `/api/projects/*` | `bff-portal` | Project Management | Pending |
| `/api/manufacturing/*`| `bff-shopfloor` / `bff-portal` | Manufacturing | Pending |
| `/api/bi/*` | `bff-portal` | Business Intelligence | Pending |
| `/api/admin/*` | `bff-portal` | System Administration | Pending |
| `/api/fixed-assets/*` | `bff-portal` | Asset Management | Pending |
| `/api/store/*` | `bff-storefront` | E-commerce Storefront | Pending |
| `/api/pos/*` | `bff-pos` | Point of Sale | Pending |
| `/api/wms/*` | `bff-wms` | Warehouse Management | Pending |
| `/api/shopfloor/*` | `bff-shopfloor` | Shopfloor Execution | Pending |
| `/api/cms/*` | `bff-cms` | Content Management | Pending |
| `/api/support/*` | `bff-support` | Support & Helpdesk | Pending |
| `/api/site/*` | `bff-site-public` | Public Site Data | Pending |
| `/graphql` | All BFFs | Federation Proxy (Resilient) | Pending |

## Consumidores
- **Portal Web (apps/client/web/portal)**: Usa `bff-portal`
- **POS App (apps/client/web/pos)**: Usa `bff-pos`
- **WMS App (apps/client/web/wms)**: Usa `bff-wms`
- **Mobile App (apps/client/mobile/app)**: Usa `bff-portal` / Multi-BFF
- **E-commerce (apps/client/web/store)**: Usa `bff-storefront`
- **Public Site (apps/client/web/site)**: Usa `bff-site-public`
- **CMS (apps/client/web/cms)**: Usa `bff-cms`
- **Support Portal (apps/client/web/support)**: Usa `bff-support`
- **Shopfloor (apps/client/web/shopfloor)**: Usa `bff-shopfloor`
