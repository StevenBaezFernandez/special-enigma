# Informe Detallado de Análisis de Microservicios y Aplicaciones

## Resumen Ejecutivo
Se ha realizado un análisis exhaustivo de 33 proyectos. Cada proyecto se ejecutó de forma independiente utilizando `npx nx serve` durante 45-60 segundos. Se capturaron los logs completos para identificar patrones de error y fallos de infraestructura.

### Estadísticas Generales
- Total analizado: 33
- Exitosos (sin errores detectados): 6
- Con errores: 27

## Categorización de Errores Encontrados
- **TypeScript Errors**: presente en 25 proyectos.
- **Missing Modules/Files**: presente en 20 proyectos.
- **Build Failures**: presente en 16 proyectos.
- **Runtime/Environment Errors**: presente en 12 proyectos.
- **Nx/Infrastructure Errors**: presente en 19 proyectos.

## Análisis por Proyecto
### api-accounting-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/accounting/application/src/lib/listeners/accounting.listener.ts 109:305-322
WARNING in ./libs/domain/accounting/application/src/lib/listeners/accounting.listener.ts 109:342-359
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/create-account.use-case.ts 35:57-74
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/create-account.use-case.ts 35:94-111
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/get-accounts.use-case.ts 19:57-74
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/get-accounts.use-case.ts 19:94-111
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/get-journal-entries.use-case.ts 19:57-79
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/get-journal-entries.use-case.ts 19:99-121
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/record-journal-entry.use-case.ts 49:57-79
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/record-journal-entry.use-case.ts 49:99-121
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/record-journal-entry.use-case.ts 49:173-190
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/record-journal-entry.use-case.ts 49:210-227
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/setup-chart-of-accounts.use-case.ts 37:57-74
WARNING in ./libs/domain/accounting/application/src/lib/use-cases/setup-chart-of-accounts.use-case.ts 37:94-111
WARNING in ./libs/domain/accounting/presentation/src/lib/controllers/accounting-events.controller.ts 58:179-196
WARNING in ./libs/domain/accounting/presentation/src/lib/controllers/accounting-events.controller.ts 58:216-233
WARNING in ./libs/domain/accounting/presentation/src/lib/controllers/accounting.controller.ts 36:57-73
WARNING in ./libs/domain/accounting/presentation/src/lib/controllers/accounting.controller.ts 36:93-109
WARNING in ./libs/domain/accounting/presentation/src/lib/controllers/accounting.controller.ts 44:57-78
WARNING in ./libs/domain/accounting/presentation/src/lib/controllers/accounting.controller.ts 44:98-119
WARNING in ./libs/domain/accounting/presentation/src/lib/loaders/account.loader.ts 20:57-74
WARNING in ./libs/domain/accounting/presentation/src/lib/loaders/account.loader.ts 20:94-111
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
Error: Could not find /app/dist/apps/api-accounting-app/main.js. Make sure your build succeeded.
 NX   Running target serve for project api-accounting-app failed
```

### api-admin-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/admin/application/src/lib/services/admin-dashboard.service.ts 17:57-73
WARNING in ./libs/domain/admin/application/src/lib/services/admin-dashboard.service.ts 17:93-109
WARNING in ./libs/domain/admin/application/src/lib/services/data-import.service.ts 96:57-75
WARNING in ./libs/domain/admin/application/src/lib/services/data-import.service.ts 96:95-113
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./libs/domain/admin/application/src/lib/services/data-import.service.ts:[32m[1m18:34[22m[39m
[90mTS2345: [39mArgument of type 'Buffer<ArrayBufferLike>' is not assignable to parameter of type 'Buffer'.
   [90m 20 |[39m         [36mthis[39m[33m.[39mlogger[33m.[39merror([32m'Failed to parse file'[39m[33m,[39m e)[33m;[39m
ERROR in ./libs/domain/admin/application/src/lib/use-cases/provisioning.service.ts:[32m[1m28:28[22m[39m
[90mTS2769: [39mNo overload matches this call.
  Overload 1 of 8, '(options: RedisOptions): Redis', gave the following error.
  Overload 2 of 8, '(port: number): Redis', gave the following error.
  Overload 3 of 8, '(path: string): Redis', gave the following error.
ERROR in ./libs/domain/admin/application/src/lib/use-cases/provisioning.service.ts:[32m[1m62:45[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'connectionString' does not exist in type 'ForkOptions'.
ERROR in ./libs/domain/admin/application/src/lib/use-cases/provisioning.service.ts:[32m[1m63:24[22m[39m
[90mTS2339: [39mProperty 'getSchemaGenerator' does not exist on type 'EntityManager<IDatabaseDriver<Connection>>'.
ERROR in ./libs/domain/admin/application/src/lib/use-cases/provisioning.service.ts:[32m[1m73:31[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'schema' does not exist in type 'string[] | MigrateOptions'.
ERROR in ./libs/domain/admin/application/src/lib/use-cases/provisioning.service.ts:[32m[1m75:47[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'connectionString' does not exist in type 'ForkOptions'.
ERROR in ./libs/domain/admin/application/src/lib/use-cases/provisioning.service.ts:[32m[1m76:26[22m[39m
[90mTS2339: [39mProperty 'getMigrator' does not exist on type 'EntityManager<IDatabaseDriver<Connection>>'.
webpack 5.104.1 compiled with 7 errors and 6 warnings in 8176 ms
[1m[31mBuild failed, waiting for changes to restart...[39m[22m
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
Error: Could not find /app/dist/apps/api-admin-app/main.js. Make sure your build succeeded.
 NX   Running target serve for project api-admin-app failed
```

### api-bi-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/bi/application/src/lib/use-cases/generate-report.use-case.ts 36:57-75
WARNING in ./libs/domain/bi/application/src/lib/use-cases/generate-report.use-case.ts 36:95-113
WARNING in ./libs/domain/bi/application/src/lib/use-cases/generate-report.use-case.ts 36:165-187
WARNING in ./libs/domain/bi/application/src/lib/use-cases/generate-report.use-case.ts 36:207-229
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-ar-aging.use-case.ts 17:57-68
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-ar-aging.use-case.ts 17:88-99
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-expenses.use-case.ts 17:57-69
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-expenses.use-case.ts 17:89-101
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-invoice-status.use-case.ts 17:57-68
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-invoice-status.use-case.ts 17:88-99
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-top-products.use-case.ts 17:57-66
WARNING in ./libs/domain/bi/application/src/lib/use-cases/get-top-products.use-case.ts 17:86-95
WARNING in ./libs/domain/bi/infrastructure/src/lib/adapters/bi-expenses.adapter.ts 26:57-74
WARNING in ./libs/domain/bi/infrastructure/src/lib/adapters/bi-expenses.adapter.ts 26:94-111
WARNING in ./libs/domain/bi/infrastructure/src/lib/adapters/bi-invoice.adapter.ts 58:57-74
WARNING in ./libs/domain/bi/infrastructure/src/lib/adapters/bi-invoice.adapter.ts 58:94-111
WARNING in ./libs/domain/billing/application/src/lib/use-cases/add-payment-method.use-case.ts 19:57-80
WARNING in ./libs/domain/billing/application/src/lib/use-cases/add-payment-method.use-case.ts 19:100-123
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:57-74
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:94-111
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:163-180
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:200-217
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:269-291
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:311-333
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:737-759
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:779-801
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:853-884
WARNING in ./libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:904-935
WARNING in ./libs/domain/billing/application/src/lib/use-cases/get-invoices.use-case.ts 17:57-74
WARNING in ./libs/domain/billing/application/src/lib/use-cases/get-invoices.use-case.ts 17:94-111
```

### api-billing-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[96mlibs/domain/billing/domain/src/lib/services/fiscal-stamping.service.ts[0m:[93m30[0m:[93m55[0m - [91merror[0m[90m TS2554: [0mExpected 1 arguments, but got 2.
[96mlibs/domain/billing/domain/src/lib/services/fiscal-stamping.service.ts[0m:[93m33[0m:[93m49[0m - [91merror[0m[90m TS2339: [0mProperty 'getBuilder' does not exist on type 'FiscalDocumentBuilderFactory'.
[1m[31m[96mlibs/platform/xslt/src/lib/xslt.service.ts[0m:[93m4[0m:[93m33[0m - [91merror[0m[90m TS2307: [0mCannot find module 'xslt-processor' or its corresponding type declarations.
[1m[31m[96mnode_modules/@types/request/index.d.ts[0m:[93m389[0m:[93m84[0m - [91merror[0m[90m TS2724: [0m'"/app/node_modules/tough-cookie/dist/index"' has no exported member named 'CookieJar'. Did you mean 'Cookie'?
 NX   Running target serve for project api-billing-app and 22 tasks it depends on failed
```

### api-catalog-app [Error]
**Categorías de error:** Build Failures

**Extracto de logs relevantes:**
```
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:171-193[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:213-235[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/delete-product.use-case.ts[39m[22m [1m[32m25:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/delete-product.use-case.ts[39m[22m [1m[32m25:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/delete-product.use-case.ts[39m[22m [1m[32m25:171-193[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/delete-product.use-case.ts[39m[22m [1m[32m25:213-235[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-product-by-id.use-case.ts[39m[22m [1m[32m17:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-product-by-id.use-case.ts[39m[22m [1m[32m17:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-product-by-sku.use-case.ts[39m[22m [1m[32m17:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-product-by-sku.use-case.ts[39m[22m [1m[32m17:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-products.use-case.ts[39m[22m [1m[32m17:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-products.use-case.ts[39m[22m [1m[32m17:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-sat-catalogs.use-case.ts[39m[22m [1m[32m23:57-77[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/get-sat-catalogs.use-case.ts[39m[22m [1m[32m23:97-117[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/update-product.use-case.ts[39m[22m [1m[32m42:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/update-product.use-case.ts[39m[22m [1m[32m42:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/update-product.use-case.ts[39m[22m [1m[32m42:171-193[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/update-product.use-case.ts[39m[22m [1m[32m42:213-235[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/presentation/src/lib/controllers/catalog.controller.ts[39m[22m [1m[32m84:57-73[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/presentation/src/lib/controllers/catalog.controller.ts[39m[22m [1m[32m84:93-109[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/presentation/src/lib/controllers/catalog.controller.ts[39m[22m [1m[32m93:65-81[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/presentation/src/lib/controllers/catalog.controller.ts[39m[22m [1m[32m93:101-117[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/kernel/auth/src/lib/services/secret-manager.service.ts[39m[22m [1m[32m86:57-71[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/kernel/auth/src/lib/services/secret-manager.service.ts[39m[22m [1m[32m86:91-105[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:57-78[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:98-119[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:171-193[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/catalog/application/src/lib/use-cases/create-product.use-case.ts[39m[22m [1m[32m30:213-235[39m[22m
```

### api-crm-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[96mlibs/domain/crm/application/src/lib/use-cases/approve-sale.use-case.ts[0m:[93m17[0m:[93m72[0m - [91merror[0m[90m TS2339: [0mProperty 'NEGOTIATION' does not exist on type 'typeof SaleStatus'.
[96mlibs/domain/crm/application/src/lib/use-cases/approve-sale.use-case.ts[0m:[93m20[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'APPROVED' does not exist on type 'typeof SaleStatus'.
[96mlibs/domain/crm/application/src/lib/use-cases/cancel-sale.use-case.ts[0m:[93m17[0m:[93m36[0m - [91merror[0m[90m TS2339: [0mProperty 'COMPLETED' does not exist on type 'typeof SaleStatus'.
[96mlibs/domain/crm/application/src/lib/use-cases/complete-sale.use-case.ts[0m:[93m17[0m:[93m36[0m - [91merror[0m[90m TS2339: [0mProperty 'APPROVED' does not exist on type 'typeof SaleStatus'.
[96mlibs/domain/crm/application/src/lib/use-cases/complete-sale.use-case.ts[0m:[93m20[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'COMPLETED' does not exist on type 'typeof SaleStatus'.
[96mlibs/domain/crm/application/src/lib/use-cases/create-sale.use-case.ts[0m:[93m4[0m:[93m38[0m - [91merror[0m[90m TS2307: [0mCannot find module '@virteex/domain-crm-domain/ports/inventory.service' or its corresponding type declarations.
[96mlibs/domain/crm/application/src/lib/use-cases/create-sale.use-case.ts[0m:[93m86[0m:[93m18[0m - [91merror[0m[90m TS2339: [0mProperty 'add' does not exist on type 'any[]'.
[96mlibs/domain/crm/application/src/lib/use-cases/create-sale.use-case.ts[0m:[93m117[0m:[93m34[0m - [91merror[0m[90m TS2339: [0mProperty 'APPROVED' does not exist on type 'typeof SaleStatus'.
 NX   Running target serve for project api-crm-app and 13 tasks it depends on failed
```

### api-fiscal-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[96mlibs/platform/xslt/src/lib/xslt.service.ts[0m:[93m4[0m:[93m33[0m - [91merror[0m[90m TS2307: [0mCannot find module 'xslt-processor' or its corresponding type declarations.
[1m[31m[96mlibs/domain/billing/domain/src/lib/services/fiscal-stamping.service.ts[0m:[93m30[0m:[93m55[0m - [91merror[0m[90m TS2554: [0mExpected 1 arguments, but got 2.
[96mlibs/domain/billing/domain/src/lib/services/fiscal-stamping.service.ts[0m:[93m33[0m:[93m49[0m - [91merror[0m[90m TS2339: [0mProperty 'getBuilder' does not exist on type 'FiscalDocumentBuilderFactory'.
[1m[31m[96mlibs/domain/fiscal/application/src/lib/use-cases/create-declaration.use-case.ts[0m:[93m17[0m:[93m44[0m - [91merror[0m[90m TS2554: [0mExpected 0 arguments, but got 3.
[96mlibs/domain/fiscal/application/src/lib/use-cases/create-tax-rule.use-case.ts[0m:[93m19[0m:[93m36[0m - [91merror[0m[90m TS2554: [0mExpected 0 arguments, but got 5.
[96mlibs/domain/fiscal/application/src/lib/use-cases/get-fiscal-stats.use-case.ts[0m:[93m12[0m:[93m36[0m - [91merror[0m[90m TS2339: [0mProperty 'getFiscalStats' does not exist on type 'FiscalDataProvider'.
[96mlibs/domain/fiscal/application/src/lib/use-cases/get-tax-rate.use-case.ts[0m:[93m12[0m:[93m48[0m - [91merror[0m[90m TS2339: [0mProperty 'getFiscalConfig' does not exist on type 'TenantConfigRepository'.
[96mlibs/domain/fiscal/application/src/lib/use-cases/get-tax-rules.use-case.ts[0m:[93m12[0m:[93m48[0m - [91merror[0m[90m TS2339: [0mProperty 'findByTenant' does not exist on type 'TaxRuleRepository'.
 NX   Running target serve for project api-fiscal-app and 16 tasks it depends on failed
```

### api-fixed-assets-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/fixed-assets/application/src/lib/use-cases/create-fixed-asset.use-case.ts 25:57-77
WARNING in ./libs/domain/fixed-assets/application/src/lib/use-cases/create-fixed-asset.use-case.ts 25:97-117
WARNING in ./libs/domain/fixed-assets/application/src/lib/use-cases/get-fixed-assets.use-case.ts 17:57-77
WARNING in ./libs/domain/fixed-assets/application/src/lib/use-cases/get-fixed-assets.use-case.ts 17:97-117
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./apps/api/fixed-assets/app/src/app/app.module.ts:[32m[1m9:53[22m[39m
[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.
ERROR in ./apps/api/fixed-assets/app/src/main.ts:[32m[1m8:26[22m[39m
[90mTS2554: [39mExpected 1 arguments, but got 2.
ERROR in ./libs/domain/fixed-assets/infrastructure/src/lib/persistence/fixed-assets.schemas.ts:[32m[1m23:5[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'fixedAssetId' does not exist in type '{ readonly id: EntitySchemaProperty<string, Asset>; readonly tenantId: EntitySchemaProperty<string, Asset>; readonly code: EntitySchemaProperty<...>; ... 9 more ...; readonly updatedAt: EntitySchemaProperty<...>; }'.
ERROR in ./libs/domain/fixed-assets/infrastructure/src/lib/persistence/fixed-assets.schemas.ts:[32m[1m33:5[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'fixedAssetId' does not exist in type '{ readonly id: EntitySchemaProperty<string, Depreciation>; readonly tenantId: EntitySchemaProperty<string, Depreciation>; ... 4 more ...; readonly createdAt: EntitySchemaProperty<...>; }'.
webpack 5.104.1 compiled with 4 errors and 6 warnings in 7175 ms
[1m[31mBuild failed, waiting for changes to restart...[39m[22m
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
Error: Could not find /app/dist/apps/api-fixed-assets-app/main.js. Make sure your build succeeded.
 NX   Running target serve for project api-fixed-assets-app failed
```

### api-gateway-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[96mlibs/platform/xslt/src/lib/xslt.service.ts[0m:[93m4[0m:[93m33[0m - [91merror[0m[90m TS2307: [0mCannot find module 'xslt-processor' or its corresponding type declarations.
 NX   Running target serve for project api-gateway-app and 25 tasks it depends on failed
```

### api-gateway-legacy-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[33mWARNING[39m[22m in [1m../../../../libs/kernel/auth/src/lib/services/secret-manager.service.ts[39m[22m [1m[32m86:57-71[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/kernel/auth/src/lib/services/secret-manager.service.ts[39m[22m [1m[32m86:91-105[39m[22m
[1m[31mERROR[39m[22m in [1m./src/app/app.module.ts[39m[22m [1m[32m11:0-112[39m[22m
[1m[31mERROR[39m[22m in [1m./src/app/app.module.ts:[32m[1m14:73[22m[39m[1m[39m[22m
[90mTS2307: [39mCannot find module '@virteex/platform-contract-governance' or its corresponding type declarations.
webpack compiled with [1m[31m2 errors[39m[22m and [1m[33m2 warnings[39m[22m (daaabe5e704b2802)
 NX   Running target serve for project api-gateway-legacy-app and 6 tasks it depends on failed
```

### api-identity-app [Error]
**Categorías de error:** TypeScript Errors, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[96mlibs/domain/identity/application/src/lib/use-cases/complete-onboarding.use-case.ts[0m:[93m27[0m:[93m26[0m - [91merror[0m[90m TS2304: [0mCannot find name 'EntityManager'.
[96mlibs/domain/identity/application/src/lib/use-cases/complete-onboarding.use-case.ts[0m:[93m83[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'plan' does not exist on type 'Tenant'.
[96mlibs/domain/identity/application/src/lib/use-cases/confirm-mfa.use-case.ts[0m:[93m31[0m:[93m31[0m - [91merror[0m[90m TS2339: [0mProperty 'update' does not exist on type 'UserRepository'.
[96mlibs/domain/identity/application/src/lib/use-cases/get-subscription-status.use-case.ts[0m:[93m7[0m:[93m36[0m - [91merror[0m[90m TS2304: [0mCannot find name 'EntityManager'.
[96mlibs/domain/identity/application/src/lib/use-cases/setup-mfa.use-case.ts[0m:[93m33[0m:[93m31[0m - [91merror[0m[90m TS2339: [0mProperty 'update' does not exist on type 'UserRepository'.
[96mlibs/domain/identity/application/src/lib/use-cases/update-subscription.use-case.ts[0m:[93m12[0m:[93m36[0m - [91merror[0m[90m TS2304: [0mCannot find name 'EntityManager'.
 NX   Running target serve for project api-identity-app and 17 tasks it depends on failed
```

### api-inventory-app [Error]
**Categorías de error:** TypeScript Errors, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/index.ts[39m[22m [1m[32m15:0-83[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/check-stock.use-case.ts[39m[22m [1m[32m24:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/check-stock.use-case.ts[39m[22m [1m[32m24:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/create-warehouse.use-case.ts[39m[22m [1m[32m53:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/create-warehouse.use-case.ts[39m[22m [1m[32m53:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/delete-warehouse.use-case.ts[39m[22m [1m[32m21:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/delete-warehouse.use-case.ts[39m[22m [1m[32m21:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/get-warehouse.use-case.ts[39m[22m [1m[32m26:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/get-warehouse.use-case.ts[39m[22m [1m[32m26:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/get-warehouses.use-case.ts[39m[22m [1m[32m23:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/get-warehouses.use-case.ts[39m[22m [1m[32m23:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/register-movement.use-case.ts[39m[22m [1m[32m83:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/register-movement.use-case.ts[39m[22m [1m[32m83:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/register-movement.use-case.ts[39m[22m [1m[32m83:167-186[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/register-movement.use-case.ts[39m[22m [1m[32m83:206-225[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/register-movement.use-case.ts[39m[22m [1m[32m83:277-291[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/register-movement.use-case.ts[39m[22m [1m[32m83:311-325[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/reserve-batch-stock.use-case.ts[39m[22m [1m[32m43:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/reserve-batch-stock.use-case.ts[39m[22m [1m[32m43:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/reserve-stock.use-case.ts[39m[22m [1m[32m22:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/reserve-stock.use-case.ts[39m[22m [1m[32m22:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/update-warehouse.use-case.ts[39m[22m [1m[32m38:57-76[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/application/src/lib/use-cases/update-warehouse.use-case.ts[39m[22m [1m[32m38:96-115[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/movements.controller.ts[39m[22m [1m[32m27:167-178[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/movements.controller.ts[39m[22m [1m[32m27:198-209[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/reservations.controller.ts[39m[22m [1m[32m26:169-180[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/reservations.controller.ts[39m[22m [1m[32m26:200-211[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/stock.controller.ts[39m[22m [1m[32m36:159-170[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/stock.controller.ts[39m[22m [1m[32m36:190-201[39m[22m
[1m[33mWARNING[39m[22m in [1m../../../../libs/domain/inventory/presentation/src/lib/controllers/warehouses.controller.ts[39m[22m [1m[32m46:165-176[39m[22m
```

### api-manufacturing-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/manufacturing/application/src/index.ts 3:0-94
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:57-82
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:102-127
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:179-195
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:215-231
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:283-308
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:328-353
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/get-production-orders.use-case.ts 17:57-82
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/get-production-orders.use-case.ts 17:102-127
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./apps/api/manufacturing/app/src/app/app.module.ts:[32m[1m9:53[22m[39m
[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.
ERROR in ./apps/api/manufacturing/app/src/main.ts:[32m[1m8:26[22m[39m
[90mTS2554: [39mExpected 1 arguments, but got 2.
ERROR in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts:[32m[1m38:60[22m[39m
[90mTS2554: [39mExpected 1 arguments, but got 2.
ERROR in ./libs/domain/manufacturing/infrastructure/src/lib/adapters/http-inventory.adapter.ts:[32m[1m5:34[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-manufacturing-domain/ports/inventory.service' or its corresponding type declarations.
ERROR in ./libs/domain/manufacturing/infrastructure/src/lib/persistence/manufacturing.schemas.ts:[32m[1m9:5[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'orderNumber' does not exist in type '{ id: EntitySchemaProperty<string, ProductionOrder>; tenantId: EntitySchemaProperty<string, ProductionOrder>; ... 5 more ...; components: EntitySchemaProperty<...>; }'.
ERROR in ./libs/domain/manufacturing/infrastructure/src/lib/persistence/manufacturing.schemas.ts:[32m[1m25:5[22m[39m
[90mTS2322: [39mType '{ kind: "1:m"; entity: string; mappedBy: "bom"; cascade: Cascade.ALL[]; }' is not assignable to type 'EntitySchemaProperty<BillOfMaterialsComponent, BillOfMaterials>'.
ERROR in ./libs/domain/manufacturing/infrastructure/src/lib/persistence/manufacturing.schemas.ts:[32m[1m33:5[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'bom' does not exist in type '{ id: EntitySchemaProperty<string, BillOfMaterialsComponent>; tenantId: EntitySchemaProperty<string, BillOfMaterialsComponent>; componentProductSku: EntitySchemaProperty<...>; quantity: EntitySchemaProperty<...>; unit: EntitySchemaProperty<...>; billOfMaterials: EntitySchemaProperty<...>; }'.
webpack 5.104.1 compiled with 7 errors and 11 warnings in 7706 ms
[1m[31mBuild failed, waiting for changes to restart...[39m[22m
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
Error: Could not find /app/dist/apps/api-manufacturing-app/main.js. Make sure your build succeeded.
 NX   Running target serve for project api-manufacturing-app failed
```

### api-payroll-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 57:23-42
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 58:25-44
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 60:84-109
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 85:90-117
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:57-75
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:95-113
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:165-182
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:202-219
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:271-289
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:309-327
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:379-401
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:421-443
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:495-515
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 104:535-555
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/get-employees.use-case.ts 17:57-75
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/get-employees.use-case.ts 17:95-113
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 32:31-49
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 49:25-43
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 75:64-89
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 76:66-93
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 250:57-74
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 250:94-111
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 250:163-174
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 250:194-205
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 250:257-279
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/stamp-payroll.use-case.ts 250:299-321
WARNING in ./libs/domain/payroll/infrastructure/src/lib/strategies/generic-latam.strategy.ts 116:57-75
WARNING in ./libs/domain/payroll/infrastructure/src/lib/strategies/generic-latam.strategy.ts 116:95-113
WARNING in ./libs/domain/payroll/infrastructure/src/lib/strategies/mexican-tax.strategy.ts 117:57-75
WARNING in ./libs/domain/payroll/infrastructure/src/lib/strategies/mexican-tax.strategy.ts 117:95-113
```

### api-plugin-host-app [Error]
**Categorías de error:** TypeScript Errors, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[4m[34mapps/api/plugin-host/app/src/sandbox.service.ts:2:1[39m[24m - [31m[1merror[22m[39m [90mTS1202[39m: Import assignment cannot be used when targeting ECMAScript modules. Consider using 'import * as ns from "mod"', 'import {a} from "mod"', 'import d from "mod"', or another module format instead.
[4m[34mapps/api/plugin-host/app/src/test/mocks/isolated-vm.mock.ts:22:14[39m[24m - [31m[1merror[22m[39m [90mTS2304[39m: Cannot find name 'vi'.
[4m[34mapps/api/plugin-host/app/src/test/mocks/isolated-vm.mock.ts:23:16[39m[24m - [31m[1merror[22m[39m [90mTS2304[39m: Cannot find name 'vi'.
Found 3 errors.
 NX   Running target serve for project api-plugin-host-app and 8 tasks it depends on failed
```

### api-pos [Success]
Servicio iniciado o en espera sin errores detectados en el tiempo asignado.

### api-projects-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/projects/application/src/lib/use-cases/create-project.use-case.ts 27:57-74
WARNING in ./libs/domain/projects/application/src/lib/use-cases/create-project.use-case.ts 27:94-111
WARNING in ./libs/domain/projects/application/src/lib/use-cases/get-my-work.use-case.ts 17:57-74
WARNING in ./libs/domain/projects/application/src/lib/use-cases/get-my-work.use-case.ts 17:94-111
WARNING in ./libs/domain/projects/application/src/lib/use-cases/get-projects.use-case.ts 17:57-74
WARNING in ./libs/domain/projects/application/src/lib/use-cases/get-projects.use-case.ts 17:94-111
WARNING in ./libs/domain/projects/domain/src/index.ts 2:0-43
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./apps/api/projects/app/src/app/app.module.ts:[32m[1m9:53[22m[39m
[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.
ERROR in ./apps/api/projects/app/src/main.ts:[32m[1m8:26[22m[39m
[90mTS2554: [39mExpected 1 arguments, but got 2.
ERROR in ./libs/domain/projects/application/src/lib/use-cases/create-project.use-case.ts:[32m[1m18:33[22m[39m
[90mTS2554: [39mExpected 0 arguments, but got 3.
ERROR in ./libs/domain/projects/application/src/lib/use-cases/create-project.use-case.ts:[32m[1m19:34[22m[39m
[90mTS2339: [39mProperty 'description' does not exist on type 'Project'.
ERROR in ./libs/domain/projects/domain/src/index.ts:[32m[1m2:1[22m[39m
[90mTS2308: [39mModule './lib/entities/project.entity' has already exported a member named 'Task'. Consider explicitly re-exporting to resolve the ambiguity.
ERROR in ./libs/domain/projects/infrastructure/src/lib/persistence/projects.schemas.ts:[32m[1m14:5[22m[39m
[90mTS2322: [39mType '{ kind: "1:m"; entity: string; mappedBy: "project"; cascade: Cascade.ALL[]; }' is not assignable to type 'EntitySchemaProperty<Task, Project>'.
ERROR in ./libs/domain/projects/infrastructure/src/lib/persistence/projects.schemas.ts:[32m[1m22:5[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'project' does not exist in type '{ id: EntitySchemaProperty<string, Task>; name: EntitySchemaProperty<string, Task>; }'.
webpack 5.104.1 compiled with 7 errors and 9 warnings in 7917 ms
[1m[31mBuild failed, waiting for changes to restart...[39m[22m
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
Error: Could not find /app/dist/apps/api-projects-app/main.js. Make sure your build succeeded.
 NX   Running target serve for project api-projects-app failed
```

### api-purchasing-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/approve-requisition.use-case.ts 27:57-78
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/approve-requisition.use-case.ts 27:98-119
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-purchase-order.use-case.ts 34:57-81
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-purchase-order.use-case.ts 34:101-125
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-purchase-order.use-case.ts 34:177-196
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-purchase-order.use-case.ts 34:216-235
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-requisition.use-case.ts 20:57-78
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-requisition.use-case.ts 20:98-119
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-supplier.use-case.ts 28:57-76
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-supplier.use-case.ts 28:96-115
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-vendor-bill.use-case.ts 21:57-77
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/create-vendor-bill.use-case.ts 21:97-117
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/get-requisitions.use-case.ts 17:57-78
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/get-requisitions.use-case.ts 17:98-119
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/get-vendor-bill.use-case.ts 22:57-77
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/get-vendor-bill.use-case.ts 22:97-117
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/reject-requisition.use-case.ts 26:57-78
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/reject-requisition.use-case.ts 26:98-119
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/update-vendor-bill.use-case.ts 37:57-77
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/update-vendor-bill.use-case.ts 37:97-117
WARNING in ./libs/domain/purchasing/domain/src/index.ts 3:0-58
WARNING in ./libs/domain/purchasing/presentation/src/lib/controllers/purchasing.controller.ts 87:57-77
WARNING in ./libs/domain/purchasing/presentation/src/lib/controllers/purchasing.controller.ts 87:97-117
WARNING in ./libs/domain/purchasing/presentation/src/lib/controllers/purchasing.controller.ts 100:57-76
WARNING in ./libs/domain/purchasing/presentation/src/lib/controllers/purchasing.controller.ts 100:96-115
WARNING in ./libs/domain/purchasing/presentation/src/lib/controllers/purchasing.controller.ts 108:65-84
WARNING in ./libs/domain/purchasing/presentation/src/lib/controllers/purchasing.controller.ts 108:104-123
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./apps/api/purchasing/app/src/app/app.module.ts:[32m[1m9:53[22m[39m
```

### api-subscription-app [Error]
**Categorías de error:** TypeScript Errors, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[96mnode_modules/@types/request/index.d.ts[0m:[93m389[0m:[93m84[0m - [91merror[0m[90m TS2724: [0m'"/app/node_modules/tough-cookie/dist/index"' has no exported member named 'CookieJar'. Did you mean 'Cookie'?
 NX   Running target serve for project api-subscription-app and 11 tasks it depends on failed
```

### api-treasury-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Nx/Infrastructure Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/domain/treasury/application/src/lib/use-cases/create-bank-account.use-case.ts 32:57-78
WARNING in ./libs/domain/treasury/application/src/lib/use-cases/create-bank-account.use-case.ts 32:98-119
WARNING in ./libs/domain/treasury/application/src/lib/use-cases/get-bank-accounts.use-case.ts 31:57-78
WARNING in ./libs/domain/treasury/application/src/lib/use-cases/get-bank-accounts.use-case.ts 31:98-119
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./libs/domain/treasury/application/src/lib/services/reconciliation.service.ts 5:0-108
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/get-cash-flow.use-case.ts 4:0-108
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts 5:0-90
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts 6:0-108
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts 7:0-109
ERROR in ./apps/api/treasury/app/src/app/app.module.ts:[32m[1m9:53[22m[39m
[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.
ERROR in ./apps/api/treasury/app/src/main.ts:[32m[1m8:26[22m[39m
[90mTS2554: [39mExpected 1 arguments, but got 2.
ERROR in ./libs/domain/treasury/application/src/lib/services/reconciliation.service.ts:[32m[1m3:39[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-domain/repositories/transaction.repository' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/get-cash-flow.use-case.ts:[32m[1m2:29[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-domain/entities/transaction.entity' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/get-cash-flow.use-case.ts:[32m[1m3:39[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-domain/repositories/transaction.repository' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts:[32m[1m3:29[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-domain/entities/transaction.entity' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts:[32m[1m4:33[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-contracts/enums/transaction-type.enum' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts:[32m[1m5:39[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-domain/repositories/transaction.repository' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts:[32m[1m6:39[22m[39m
[90mTS2307: [39mCannot find module '@virteex/domain-treasury-domain/repositories/bank-account.repository' or its corresponding type declarations.
ERROR in ./libs/domain/treasury/application/src/lib/use-cases/register-transaction.use-case.ts:[32m[1m7:40[22m[39m
```

### desktop-app [Error]
**Categorías de error:** Runtime/Environment Errors

**Extracto de logs relevantes:**
```
[1m[31m[29566:0313/175852.830177:ERROR:ozone_platform_x11.cc(246)] Missing X server or $DISPLAY
[1m[31m[29566:0313/175852.830432:ERROR:env.cc(257)] The platform failed to initialize.  Exiting.
[32mNo typescript errors found.[39m
```

### mobile-app [Success]
Servicio iniciado o en espera sin errores detectados en el tiempo asignado.

### web-cms-app [Success]
Servicio iniciado o en espera sin errores detectados en el tiempo asignado.

### web-ops-app [Success]
Servicio iniciado o en espera sin errores detectados en el tiempo asignado.

### web-portal-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures

**Extracto de logs relevantes:**
```
[37mApplication bundle generation failed. [7.169 seconds] - 2026-03-13T17:55:09.948Z
[1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/shared-util-http' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/identity-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/identity-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/identity-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/accounting-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/inventory-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/payroll-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/crm-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/purchasing-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/treasury-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[39m[22m[1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/fixed-assets-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/projects-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/manufacturing-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/pos-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/billing-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[1m[31m31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/catalog-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/bi-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/admin-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/fiscal-ui' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2353: Object literal may only specify known properties, and 'recaptcha' does not exist in type 'AppConfig'.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2353: Object literal may only specif[39m[22m[1m[31my known properties, and 'recaptcha' does not exist in type 'AppConfig'.[0m [1m[35m[plugin angular-compiler][0m
```

### web-pos-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures

**Extracto de logs relevantes:**
```
[37mApplication bundle generation failed. [2.281 seconds] - 2026-03-13T18:01:08.797Z
[1m[33m[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mCannot find base config file "../../../tsconfig.base.json"[0m [tsconfig.json]
[1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS5012: Cannot read file '/app/apps/tsconfig.base.json': ENOENT: no such file or directory, open '/app/apps/tsconfig.base.json'.[0m [1m[35m[plugin angular-compiler][0m
```

### web-shopfloor-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures

**Extracto de logs relevantes:**
```
[37mApplication bundle generation failed. [1.008 seconds] - 2026-03-13T17:51:45.321Z
[1m[33m[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI.[0m [1m[35m[plugin angular-compiler][0m
[1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-shopfloor-app/tsconfig.app.json"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-shopfloor-app/tsconfig.app.json'
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "/app/apps/web-shopfloor-app/src/main.ts"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "apps/web-shopfloor-app/src/styles.scss"[0m
  You can mark the path "apps/web-shopfloor-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.
```

### web-site-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures

**Extracto de logs relevantes:**
```
[37mApplication bundle generation failed. [0.888 seconds] - 2026-03-13T17:57:18.185Z
[1m[33m[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI.[0m [1m[35m[plugin angular-compiler][0m
[1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-site-app/tsconfig.app.json"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mAngular compilation emit failed.[0m [1m[35m[plugin angular-compiler][0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-site-app/tsconfig.app.json'
[31m✘ [41;31m[[41;97mERROR[41;[39m[22m[1m[31m31m][0m [1mCould not resolve "/app/apps/web-site-app/src/main.ts"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-site-app/tsconfig.app.json"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "./apps/web-site-app/src/main.server"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-site-app/tsconfig.app.json"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "./apps/web-site-app/src/server"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "apps/web-site-app/src/styles.scss"[0m
  You can mark the path "apps/web-site-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-site-app/tsconfig.app.json"[0m
```

### web-store-app [Success]
Servicio iniciado o en espera sin errores detectados en el tiempo asignado.

### web-support-app [Success]
Servicio iniciado o en espera sin errores detectados en el tiempo asignado.

### web-wms-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures

**Extracto de logs relevantes:**
```
[37mApplication bundle generation failed. [0.911 seconds] - 2026-03-13T18:01:53.971Z
[1m[33m[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported.[0m [1m[35m[plugin angular-compiler][0m
[33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mTypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI.[0m [1m[35m[plugin angular-compiler][0m
[1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-wms-app/tsconfig.app.json"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-wms-app/tsconfig.app.json'
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "/app/apps/web-wms-app/src/main.ts"[0m
[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "apps/web-wms-app/src/styles.scss"[0m
  You can mark the path "apps/web-wms-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.
```

### worker-notification-app [Error]
**Categorías de error:** TypeScript Errors, Missing Modules/Files, Build Failures, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
Error: Could not find /app/dist/apps/worker/notification/app/main.js. Make sure your build succeeded.
Task "worker-notification-app:serve:development" is continuous but exited with code 1
```

### worker-scheduler-app [Error]
**Categorías de error:** TypeScript Errors, Build Failures, Nx/Infrastructure Errors, Runtime/Environment Errors

**Extracto de logs relevantes:**
```
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:91-105
ERROR in ./libs/domain/notification/domain/src/lib/entities/notification.entity.ts:[32m[1m26:54[22m[39m
[90mTS2353: [39mObject literal may only specify known properties, and 'unique' does not exist in type 'IndexOptions<typeof Notification, "tenantId" | "idempotencyKey">'.
webpack 5.104.1 compiled with 1 error and 2 warnings in 6445 ms
 NX   Running target serve for project worker-scheduler-app and 1 task it depends on failed
```
