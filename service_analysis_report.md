# Informe de Análisis de Microservicios y Aplicaciones

## Resumen Ejecutivo

- **Total de servicios/apps analizados:** 33
- **Servidos correctamente:** 0
- **Con errores de consola:** 30
- **Timeout o estado desconocido:** 3

## Detalle por Servicio

| Proyecto | Estado | Error Principal / Observación |
| --- | --- | --- |
| api-accounting-app | Error | ERROR in ./libs/domain/accounting/application/src/lib/listeners/accounting.listener.ts:[32m[1m9:10[22m[39m<br>[90mTS2305: [39mModule '"@virteex/domain-accounting-contracts"' has no exported member 'RecordJournalEntryDto'.<br>ERROR in ./libs/domain/accounting/application/src/lib/mappers/account.mapper.ts:[32m[1m2:10[22m[39m |
| api-admin-app | Error | ERROR in ./libs/domain/admin/application/src/lib/services/data-import.service.ts:[32m[1m18:34[22m[39m<br>[90mTS2345: [39mArgument of type 'Buffer<ArrayBufferLike>' is not assignable to parameter of type 'Buffer'.<br>   [90m 20 \|[39m         [36mthis[39m[33m.[39mlogger[33m.[39merror([32m'Failed to parse file'[39m[33m,[39m e)[33m;[39m |
| api-bi-app | Error | ERROR in ./libs/domain/accounting/domain/src/lib/entities/account.entity.ts:[32m[1m1:10[22m[39m<br>[90mTS2305: [39mModule '"@virteex/domain-accounting-contracts"' has no exported member 'AccountType'.<br>ERROR in ./libs/domain/accounting/domain/src/lib/entities/journal-entry.entity.ts:[32m[1m1:10[22m[39m |
| api-billing-app | Error | [1m[31m[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m11[0m:[93m3[0m - [91merror[0m[90m TS2305: [0mModule '"./exceptions"' has no exported member 'DomainException'.<br>[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m50[0m:[93m27[0m - [91merror[0m[90m TS2339: [0mProperty 'message' does not exist on type 'unknown'.<br>[1m[31m[96mlibs/platform/xslt/src/lib/xslt.service.ts[0m:[93m4[0m:[93m33[0m - [91merror[0m[90m TS2307: [0mCannot find module 'xslt-processor' or its corresponding type declarations. |
| api-catalog-app | Error | [1m[31mESM loader error: ReferenceError: Cannot access 'Plugin' before initialization |
| api-crm-app | Error | [1m[31m[96mlibs/domain/crm/application/src/lib/use-cases/approve-sale.use-case.ts[0m:[93m17[0m:[93m72[0m - [91merror[0m[90m TS2339: [0mProperty 'NEGOTIATION' does not exist on type 'typeof SaleStatus'.<br>[96mlibs/domain/crm/application/src/lib/use-cases/approve-sale.use-case.ts[0m:[93m20[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'APPROVED' does not exist on type 'typeof SaleStatus'.<br>[96mlibs/domain/crm/application/src/lib/use-cases/cancel-sale.use-case.ts[0m:[93m17[0m:[93m36[0m - [91merror[0m[90m TS2339: [0mProperty 'COMPLETED' does not exist on type 'typeof SaleStatus'. |
| api-fiscal-app | Error | [1m[31m[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m11[0m:[93m3[0m - [91merror[0m[90m TS2305: [0mModule '"./exceptions"' has no exported member 'DomainException'.<br>[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m50[0m:[93m27[0m - [91merror[0m[90m TS2339: [0mProperty 'message' does not exist on type 'unknown'.<br>[1m[31m[96mlibs/platform/xslt/src/lib/xslt.service.ts[0m:[93m4[0m:[93m33[0m - [91merror[0m[90m TS2307: [0mCannot find module 'xslt-processor' or its corresponding type declarations. |
| api-fixed-assets-app | Error | ERROR in ./apps/api/fixed-assets/app/src/app/app.module.ts:[32m[1m9:53[22m[39m<br>[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.<br>ERROR in ./apps/api/fixed-assets/app/src/main.ts:[32m[1m8:26[22m[39m |
| api-gateway-app | Error | [1m[31m[96mlibs/domain/accounting/domain/src/lib/entities/account.entity.ts[0m:[93m1[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"@virteex/domain-accounting-contracts"' has no exported member 'AccountType'.<br>[96mlibs/domain/accounting/domain/src/lib/entities/journal-entry.entity.ts[0m:[93m1[0m:[93m10[0m - [91merror[0m[90m TS2724: [0m'"@virteex/domain-accounting-contracts"' has no exported member named 'JournalEntryStatus'. Did you mean 'JournalEntry'?<br>[1m[31m[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m11[0m:[93m3[0m - [91merror[0m[90m TS2305: [0mModule '"./exceptions"' has no exported member 'DomainException'. |
| api-gateway-legacy-app | Error | [1m[31mERROR[39m[22m in [1m./src/app/app.module.ts[39m[22m [1m[32m11:0-112[39m[22m<br>[1mModule [1m[31mnot found[39m[22m[1m: [1m[31mError[39m[22m[1m: Can't resolve '@virteex/platform-contract-governance' in '/app/apps/api/gateway-legacy/app/src/app'[39m[22m<br>[1m[31mERROR[39m[22m in [1m./src/app/app.module.ts:[32m[1m14:73[22m[39m[1m[39m[22m |
| api-identity-app | Error | [1m[31m[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m11[0m:[93m3[0m - [91merror[0m[90m TS2305: [0mModule '"./exceptions"' has no exported member 'DomainException'.<br>[96mlibs/kernel/exceptions/src/lib/global-exception.filter.ts[0m:[93m50[0m:[93m27[0m - [91merror[0m[90m TS2339: [0mProperty 'message' does not exist on type 'unknown'.<br>Failed tasks: |
| api-inventory-app | Error | [1mexport 'InventoryRepository' (imported as 'InventoryRepository') was [1m[31mnot found[39m[22m[1m in '@virteex/domain-inventory-domain' (possible exports: [1m[32mDomainValidationError, INVENTORY_REPOSITORY, InsufficientStockException, InventoryMovement, InventoryMovementType, Location, PRODUCT_GATEWAY, Stock, StockBatch, StockDataInconsistencyError, StockNotFoundError, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError, WarehouseNotFoundException[39m[22m[1m)[39m[22m<br>[1mexport 'InventoryRepository' (imported as 'InventoryRepository') was [1m[31mnot found[39m[22m[1m in '@virteex/domain-inventory-domain' (possible exports: [1m[32mDomainValidationError, INVENTORY_REPOSITORY, InsufficientStockException, InventoryMovement, InventoryMovementType, Location, PRODUCT_GATEWAY, Stock, StockBatch, StockDataInconsistencyError, StockNotFoundError, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError, WarehouseNotFoundException[39m[22m[1m)[39m[22m<br>[1mexport 'WarehouseRepository' (imported as 'WarehouseRepository') was [1m[31mnot found[39m[22m[1m in '@virteex/domain-inventory-domain' (possible exports: [1m[32mDomainValidationError, INVENTORY_REPOSITORY, InsufficientStockException, InventoryMovement, InventoryMovementType, Location, PRODUCT_GATEWAY, Stock, StockBatch, StockDataInconsistencyError, StockNotFoundError, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError, WarehouseNotFoundException[39m[22m[1m)[39m[22m |
| api-manufacturing-app | Error | ERROR in ./apps/api/manufacturing/app/src/app/app.module.ts:[32m[1m9:53[22m[39m<br>[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.<br>ERROR in ./apps/api/manufacturing/app/src/main.ts:[32m[1m8:26[22m[39m |
| api-payroll-app | Error | ERROR in ./apps/api/payroll/app/src/app/app.module.ts:[32m[1m9:53[22m[39m<br>[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.<br>ERROR in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts:[32m[1m2:10[22m[39m |
| api-plugin-host-app | Error | [4m[34mapps/api/plugin-host/app/src/sandbox.service.ts:2:1[39m[24m - [31m[1merror[22m[39m [90mTS1202[39m: Import assignment cannot be used when targeting ECMAScript modules. Consider using 'import * as ns from "mod"', 'import {a} from "mod"', 'import d from "mod"', or another module format instead.<br>[4m[34mapps/api/plugin-host/app/src/test/mocks/isolated-vm.mock.ts:22:14[39m[24m - [31m[1merror[22m[39m [90mTS2304[39m: Cannot find name 'vi'.<br>[4m[34mapps/api/plugin-host/app/src/test/mocks/isolated-vm.mock.ts:23:16[39m[24m - [31m[1merror[22m[39m [90mTS2304[39m: Cannot find name 'vi'. |
| api-pos | Error | [1mexport 'InventoryRepository' (imported as 'InventoryRepository') was [1m[31mnot found[39m[22m[1m in '@virteex/domain-inventory-domain' (possible exports: [1m[32mDomainValidationError, INVENTORY_REPOSITORY, InsufficientStockException, InventoryMovement, InventoryMovementType, Location, PRODUCT_GATEWAY, Stock, StockBatch, StockDataInconsistencyError, StockNotFoundError, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError, WarehouseNotFoundException[39m[22m[1m)[39m[22m<br>[1mexport 'InventoryRepository' (imported as 'InventoryRepository') was [1m[31mnot found[39m[22m[1m in '@virteex/domain-inventory-domain' (possible exports: [1m[32mDomainValidationError, INVENTORY_REPOSITORY, InsufficientStockException, InventoryMovement, InventoryMovementType, Location, PRODUCT_GATEWAY, Stock, StockBatch, StockDataInconsistencyError, StockNotFoundError, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError, WarehouseNotFoundException[39m[22m[1m)[39m[22m<br>[1mexport 'WarehouseRepository' (imported as 'WarehouseRepository') was [1m[31mnot found[39m[22m[1m in '@virteex/domain-inventory-domain' (possible exports: [1m[32mDomainValidationError, INVENTORY_REPOSITORY, InsufficientStockException, InventoryMovement, InventoryMovementType, Location, PRODUCT_GATEWAY, Stock, StockBatch, StockDataInconsistencyError, StockNotFoundError, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError, WarehouseNotFoundException[39m[22m[1m)[39m[22m |
| api-projects-app | Error | ERROR in ./apps/api/projects/app/src/app/app.module.ts:[32m[1m9:53[22m[39m<br>[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.<br>ERROR in ./apps/api/projects/app/src/main.ts:[32m[1m8:26[22m[39m |
| api-purchasing-app | Error | ERROR in ./apps/api/purchasing/app/src/app/app.module.ts:[32m[1m9:53[22m[39m<br>[90mTS2339: [39mProperty 'createComplexityLimitRule' does not exist on type '(options: QueryComplexityOptions) => (context: ValidationContext) => QueryComplexity'.<br>ERROR in ./apps/api/purchasing/app/src/main.ts:[32m[1m8:26[22m[39m |
| api-subscription-app | Error | [1m[31m[96mnode_modules/@types/request/index.d.ts[0m:[93m389[0m:[93m84[0m - [91merror[0m[90m TS2724: [0m'"/app/node_modules/tough-cookie/dist/index"' has no exported member named 'CookieJar'. Did you mean 'Cookie'?<br>Failed tasks: |
| api-treasury-app | Error | ERROR in ./libs/domain/treasury/application/src/lib/services/reconciliation.service.ts 5:0-108<br>Module not found: Error: Can't resolve '@virteex/domain-treasury-domain/repositories/transaction.repository' in '/app/libs/domain/treasury/application/src/lib/services'<br>ERROR in ./libs/domain/treasury/application/src/lib/use-cases/get-cash-flow.use-case.ts 4:0-108 |
| worker-notification-app | Error | ERROR in ./apps/worker/notification/app/src/app/notification.consumer.ts:[32m[1m10:10[22m[39m<br>[90mTS2305: [39mModule '"@virteex/domain-notification-infrastructure"' has no exported member 'EmailService'.<br>  [0m [90m  8 \|[39m   [33mTenantContextValidationError[39m[33m,[39m |
| worker-scheduler-app | Error |     throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);<br>Error: Could not find /app/dist/apps/worker/scheduler/app/main.js. Make sure your build succeeded. |
| web-portal-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2305: Module '"@virteex/shared-util-auth"' has no exported member 'authInterceptor'.[0m [1m[35m[plugin angular-compiler][0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2307: Cannot find module '@virteex/shared-util-http' or its corresponding type declarations.[0m [1m[35m[plugin angular-compiler][0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2305: Module '"@virteex/shared-util-auth"' has no exported member 'authGuard'.[0m [1m[35m[plugin angular-compiler][0m |
| web-shopfloor-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-shopfloor-app/tsconfig.app.json"[0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-shopfloor-app/tsconfig.app.json'<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "/app/apps/web-shopfloor-app/src/main.ts"[0m |
| web-support-app | Timeout/Unknown | El proceso no terminó ni mostró errores claros en 45s (posiblemente sirviendo pero sin mensaje de éxito detectado). |
| web-store-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-store-app/tsconfig.app.json"[0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mAngular compilation emit failed.[0m [1m[35m[plugin angular-compiler][0m<br>  AssertionError [ERR_ASSERTION]: compilerOptions.basePath should be a string. |
| web-site-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-site-app/tsconfig.app.json"[0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mAngular compilation emit failed.[0m [1m[35m[plugin angular-compiler][0m<br>  AssertionError [ERR_ASSERTION]: compilerOptions.basePath should be a string. |
| web-cms-app | Timeout/Unknown | El proceso no terminó ni mostró errores claros en 45s (posiblemente sirviendo pero sin mensaje de éxito detectado). |
| web-ops-app | Timeout/Unknown | El proceso no terminó ni mostró errores claros en 45s (posiblemente sirviendo pero sin mensaje de éxito detectado). |
| web-pos-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS5012: Cannot read file '/app/apps/tsconfig.base.json': ENOENT: no such file or directory, open '/app/apps/tsconfig.base.json'.[0m [1m[35m[plugin angular-compiler][0m |
| web-wms-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCannot find tsconfig file "apps/web-wms-app/tsconfig.app.json"[0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-wms-app/tsconfig.app.json'<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "/app/apps/web-wms-app/src/main.ts"[0m |
| mobile-app | Error | [1m[31m[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2305: Module '"@virteex/shared-util-auth"' has no exported member 'SecureStorageService'.[0m [1m[35m[plugin angular-compiler][0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS18046: 'secureStorage' is of type 'unknown'.[0m [1m[35m[plugin angular-compiler][0m<br>[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mTS2305: Module '"@virteex/shared-util-auth"' has no exported member 'SecureStorageService'.[0m [1m[35m[plugin angular-compiler][0m |
| desktop-app | Error | [1m[31m[12961:0313/133934.919776:ERROR:ozone_platform_x11.cc(246)] Missing X server or $DISPLAY<br>[12961:0313/133934.919843:ERROR:env.cc(257)] The platform failed to initialize.  Exiting. |

## Análisis Detallado de Errores

### api-accounting-app

```

> nx run api-accounting-app:serve:development

assets by status 554 KiB [big]
  asset package-lock.json 291 KiB [compared for emit] [big]
  asset main.js 263 KiB [compared for emit] [big] (name: main) 1 related asset
asset package.json 1.71 KiB [compared for emit]
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/accounting/app/src/assets/.gitkeep] [copied]
orphan modules 243 KiB [orphan] 152 modules
runtime modules 937 bytes 4 modules
built modules 243 KiB [built]
  ./apps/api/accounting/app/src/main.ts + 149 modules 243 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/accounting/application/src/lib/listeners/accounting.listener.ts 109:305-322
export 'AccountRepository' (imported as 'AccountRepository') was not found in '@virteex/domain-accounting-domain' (possible exports: ACCOUNT_REPOSITORY, Account, FiscalYear, FiscalYearStatus, JOURNAL_ENTRY_REPOSITORY, JournalEntry, JournalEntryLine)
 @ ./libs/domain/accounting/application/src/lib/accounting-application.module.ts 8:0-69 20:12-30
 @ ./libs/domain/accounting/application/src/index.ts 1:0-52 1:0-52
 @ ./libs/domain/accounting/presentation/src/lib/accounting-presentation.module.ts 3:0-85 14:18-45
 @ ./libs/domain/accounting/presentation/src/index.ts 1:0-53 1:0-53
 @ ./apps/api/accounting/app/src/app/app.module.ts 11:0-87 45:12-40
... [intermedio] ...
Error: Could not find /app/dist/apps/api-accounting-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-accounting-app failed

Failed tasks:

- api-accounting-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-admin-app

```

> nx run api-admin-app:serve:development

assets by path *.json 226 KiB
  asset package-lock.json 225 KiB [compared for emit]
  asset package.json 1.52 KiB [compared for emit]
asset main.js 246 KiB [compared for emit] [big] (name: main) 1 related asset
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/admin/app/src/assets/.gitkeep] [copied]
orphan modules 230 KiB [orphan] 135 modules
runtime modules 937 bytes 4 modules
built modules 230 KiB [built]
  ./apps/api/admin/app/src/main.ts + 133 modules 230 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/admin/application/src/lib/services/admin-dashboard.service.ts 17:57-73
export 'DashboardGateway' (imported as 'DashboardGateway') was not found in '@virteex/domain-admin-domain' (possible exports: DASHBOARD_GATEWAY, INTEGRATION_GATEWAY, TENANT_CONFIG_REPOSITORY, TenantConfig)
 @ ./libs/domain/admin/presentation/src/lib/controllers/admin-dashboard.controller.ts 5:0-105 24:57-78 24:98-119
 @ ./libs/domain/admin/presentation/src/lib/admin-presentation.module.ts 4:0-84 13:39-63
 @ ./libs/domain/admin/presentation/src/index.ts 1:0-48 1:0-48
 @ ./apps/api/admin/app/src/app/app.module.ts 3:0-77 14:26-49
 @ ./apps/api/admin/app/src/main.ts 3:0-45 6:41-50
... [intermedio] ...
Error: Could not find /app/dist/apps/api-admin-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-admin-app failed

Failed tasks:

- api-admin-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-bi-app

```

> nx run api-bi-app:serve:development

assets by status 822 KiB [big]
  asset main.js 516 KiB [compared for emit] [big] (name: main) 1 related asset
  asset package-lock.json 306 KiB [compared for emit] [big]
asset package.json 1.84 KiB [compared for emit]
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/bi/app/src/assets/.gitkeep] [copied]
orphan modules 485 KiB [orphan] 339 modules
runtime modules 937 bytes 4 modules
built modules 486 KiB [built]
  ./apps/api/bi/app/src/main.ts + 333 modules 485 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/accounting/domain/src/lib/entities/journal-entry.entity.ts 7:13-37
export 'JournalEntryStatus' (imported as 'JournalEntryStatus') was not found in '@virteex/domain-accounting-contracts' (module has no exports)
 @ ./libs/domain/accounting/domain/src/index.ts 2:0-52 2:0-52
 @ ./libs/domain/bi/application/src/lib/use-cases/generate-report.use-case.ts 5:0-101 35:22-46 36:165-187 36:207-229
 @ ./libs/domain/bi/application/src/index.ts 2:0-57 2:0-57
 @ ./libs/domain/bi/presentation/src/lib/bi-presentation.module.ts 5:0-141 11:18-37 14:12-33 15:12-33 16:12-36
 @ ./libs/domain/bi/presentation/src/index.ts 1:0-45 1:0-45
... [intermedio] ...
Error: Could not find /app/dist/apps/api-bi-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-bi-app failed

Failed tasks:

- api-bi-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-billing-app

```

 NX   Running target serve for project api-billing-app and 22 tasks it depends on:



> nx run domain-subscription-domain:build  [existing outputs match the cache, left as is]


> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run domain-identity-domain:build  [existing outputs match the cache, left as is]


> nx run domain-billing-contracts:build  [existing outputs match the cache, left as is]


... [intermedio] ...
Compiling TypeScript files for project "domain-subscription-contracts"...
node_modules/@types/request/index.d.ts:389:84 - error TS2724: '"/app/node_modules/tough-cookie/dist/index"' has no exported member named 'CookieJar'. Did you mean 'Cookie'?

389         setCookie(cookieOrStr: Cookie | string, uri: string | Url, options?: tough.CookieJar.SetCookieOptions): void;
                                                                                       ~~~~~~~~~




 NX   Running target serve for project api-billing-app and 22 tasks it depends on failed

Failed tasks:

- exceptions:build
- platform-xslt:build
- domain-subscription-contracts:build

Hint: run the command with --verbose for more details.


```

### api-catalog-app

```

 NX   Running target serve for project api-catalog-app and 11 tasks it depends on:



> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run domain-catalog-domain:build  [existing outputs match the cache, left as is]


> nx run platform-kafka:build  [existing outputs match the cache, left as is]


> nx run kernel-auth:build  [existing outputs match the cache, left as is]


... [intermedio] ...
 NX   Successfully ran target build for project api-catalog-app and 10 tasks it depends on
Nx read the output from the cache instead of running the command for 11 out of 11 tasks.
Debugger listening on ws://localhost:9229/db642abc-9e4f-428b-b892-acb195262ec2
Debugger listening on ws://localhost:9229/db642abc-9e4f-428b-b892-acb195262ec2
For help, see: https://nodejs.org/en/docs/inspector

ESM loader error: ReferenceError: Cannot access 'Plugin' before initialization
    at /app/apps/dist/apps/virteex-catalog-service/main.js:4165:39
    at /app/apps/dist/apps/virteex-catalog-service/main.js:6176:3
    at Object.<anonymous> (/app/apps/dist/apps/virteex-catalog-service/main.js:6178:12)
    at Module._compile (node:internal/modules/cjs/loader:1705:14)
    at Object..js (node:internal/modules/cjs/loader:1838:10)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at cjsLoader (node:internal/modules/esm/translators:309:5)

 NX  Process exited with code 1, waiting for changes to restart...

```

### api-crm-app

```

 NX   Running target serve for project api-crm-app and 13 tasks it depends on:



> nx run shared-contracts:build  [existing outputs match the cache, left as is]


> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run platform-cache:build  [existing outputs match the cache, left as is]


> nx run domain-crm-domain:build  [existing outputs match the cache, left as is]


... [intermedio] ...
86       sale.items.add(saleItem);
                    ~~~
libs/domain/crm/application/src/lib/use-cases/create-sale.use-case.ts:117:34 - error TS2339: Property 'APPROVED' does not exist on type 'typeof SaleStatus'.

117         sale.status = SaleStatus.APPROVED;
                                     ~~~~~~~~

Package type is set to "commonjs" but "esm" format is included. Going to use "cjs" format instead. You can change the package type to "module" or remove type in the package.json file.



 NX   Running target serve for project api-crm-app and 13 tasks it depends on failed

Failed tasks:

- domain-crm-application:build

Hint: run the command with --verbose for more details.


```

### api-fiscal-app

```

 NX   Running target serve for project api-fiscal-app and 16 tasks it depends on:



> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run domain-billing-contracts:build  [existing outputs match the cache, left as is]


> nx run domain-identity-domain:build  [existing outputs match the cache, left as is]


> nx run kernel-auth:build  [existing outputs match the cache, left as is]


... [intermedio] ...
libs/domain/fiscal/application/src/lib/use-cases/get-tax-rules.use-case.ts:12:48 - error TS2339: Property 'findByTenant' does not exist on type 'TaxRuleRepository'.

12     const rules = await this.taxRuleRepository.findByTenant(tenantId);
                                                  ~~~~~~~~~~~~

Package type is set to "commonjs" but "esm" format is included. Going to use "cjs" format instead. You can change the package type to "module" or remove type in the package.json file.



 NX   Running target serve for project api-fiscal-app and 16 tasks it depends on failed

Failed tasks:

- exceptions:build
- platform-xslt:build
- domain-fiscal-application:build

Hint: run the command with --verbose for more details.


```

### api-fixed-assets-app

```

> nx run api-fixed-assets-app:serve:development

assets by path *.json 292 KiB
  asset package-lock.json 290 KiB [compared for emit] [big]
  asset package.json 1.65 KiB [compared for emit]
asset main.js 235 KiB [compared for emit] (name: main) 1 related asset
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/fixed-assets/app/src/assets/.gitkeep] [copied]
orphan modules 218 KiB [orphan] 136 modules
runtime modules 937 bytes 4 modules
built modules 219 KiB [built]
  ./apps/api/fixed-assets/app/src/main.ts + 134 modules 219 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/fixed-assets/application/src/lib/use-cases/create-fixed-asset.use-case.ts 25:57-77
export 'FixedAssetRepository' (imported as 'FixedAssetRepository') was not found in '@virteex/domain-fixed-assets-domain' (possible exports: Asset, AssetStatus, Depreciation, DepreciationMethod, FIXED_ASSET_REPOSITORY, FixedAsset)
 @ ./libs/domain/fixed-assets/application/src/index.ts 2:0-60 2:0-60
 @ ./libs/domain/fixed-assets/presentation/src/lib/fixed-assets-presentation.ts 4:0-88 10:18-46
 @ ./libs/domain/fixed-assets/presentation/src/index.ts 1:0-48 1:0-48
 @ ./apps/api/fixed-assets/app/src/app/app.module.ts 7:0-90 45:12-41
 @ ./apps/api/fixed-assets/app/src/main.ts 3:0-45 6:41-50
... [intermedio] ...
Error: Could not find /app/dist/apps/api-fixed-assets-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-fixed-assets-app failed

Failed tasks:

- api-fixed-assets-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-gateway-app

```

 NX   Running target serve for project api-gateway-app and 25 tasks it depends on:



> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run domain-accounting-contracts:build  [existing outputs match the cache, left as is]


> nx run domain-inventory-domain:build  [existing outputs match the cache, left as is]


> nx run platform-cache:build  [existing outputs match the cache, left as is]


... [intermedio] ...
libs/platform/xslt/src/lib/xslt.service.ts:4:33 - error TS2307: Cannot find module 'xslt-processor' or its corresponding type declarations.

4 import { XmlParser, Xslt } from 'xslt-processor';
                                  ~~~~~~~~~~~~~~~~

Package type is set to "commonjs" but "esm" format is included. Going to use "cjs" format instead. You can change the package type to "module" or remove type in the package.json file.



 NX   Running target serve for project api-gateway-app and 25 tasks it depends on failed

Failed tasks:

- domain-accounting-domain:build
- exceptions:build
- platform-xslt:build

Hint: run the command with --verbose for more details.


```

### api-gateway-legacy-app

```

 NX   Running target serve for project api-gateway-legacy-app and 6 tasks it depends on:



> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run kernel-auth:build  [existing outputs match the cache, left as is]


> nx run shared-util-server-server-config:build  [existing outputs match the cache, left as is]


> nx run kernel-tenant:build  [existing outputs match the cache, left as is]


... [intermedio] ...
    13 | } from 'graphql-query-complexity';
  > 14 | import { createTenantAwareComplexityEstimator, complexityBudgets } from '@virteex/platform-contract-governance';
       |                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    15 | import { GraphQLError } from 'graphql';
    16 | import { TenantModule } from '@virteex/kernel-tenant';
    17 | import { CanonicalTenantMiddleware } from '@virteex/kernel-auth';

webpack compiled with 2 errors and 2 warnings (daaabe5e704b2802)
Warning: command "webpack-cli build --node-env=production" exited with non-zero status code


 NX   Running target serve for project api-gateway-legacy-app and 6 tasks it depends on failed

Failed tasks:

- api-gateway-legacy-app:build

Hint: run the command with --verbose for more details.


```

### api-identity-app

```

 NX   Running target serve for project api-identity-app and 17 tasks it depends on:



> nx run domain-identity-domain:build  [existing outputs match the cache, left as is]


> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run platform-cache:build  [existing outputs match the cache, left as is]


> nx run domain-identity-contracts:build  [existing outputs match the cache, left as is]


... [intermedio] ...
11   DomainException,
     ~~~~~~~~~~~~~~~
libs/kernel/exceptions/src/lib/global-exception.filter.ts:50:27 - error TS2339: Property 'message' does not exist on type 'unknown'.

50       message = exception.message;
                             ~~~~~~~

Package type is set to "commonjs" but "esm" format is included. Going to use "cjs" format instead. You can change the package type to "module" or remove type in the package.json file.



 NX   Running target serve for project api-identity-app and 17 tasks it depends on failed

Failed tasks:

- exceptions:build

Hint: run the command with --verbose for more details.


```

### api-inventory-app

```

 NX   Running target serve for project api-inventory-app and 11 tasks it depends on:



> nx run domain-inventory-domain:build  [existing outputs match the cache, left as is]


> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run domain-inventory-contracts:build  [existing outputs match the cache, left as is]


> nx run domain-inventory-infrastructure:build  [existing outputs match the cache, left as is]


... [intermedio] ...
    15 | import depthLimit from 'graphql-depth-limit';
  > 16 | import pkg from 'graphql-query-complexity'; const { createComplexityLimitRule } = pkg;
       |                                                     ^^^^^^^^^^^^^^^^^^^^^^^^^
    17 | import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
    18 | import { AppController } from './app.controller';
    19 | import { AppService } from './app.service';

webpack compiled with 1 error and 37 warnings (945ac348dc22d447)
Warning: command "webpack-cli build --node-env=production" exited with non-zero status code


 NX   Running target serve for project api-inventory-app and 11 tasks it depends on failed

Failed tasks:

- api-inventory-app:build

Hint: run the command with --verbose for more details.


```

### api-manufacturing-app

```

> nx run api-manufacturing-app:serve:development

assets by path *.json 292 KiB
  asset package-lock.json 291 KiB [compared for emit] [big]
  asset package.json 1.65 KiB [compared for emit]
asset main.js 232 KiB [compared for emit] (name: main) 1 related asset
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/manufacturing/app/src/assets/.gitkeep] [copied]
orphan modules 217 KiB [orphan] 136 modules
runtime modules 937 bytes 4 modules
built modules 218 KiB [built]
  ./apps/api/manufacturing/app/src/main.ts + 134 modules 218 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/manufacturing/application/src/index.ts 3:0-94
export 'CreateProductionOrderInput' (reexported as 'CreateProductionOrderInput') was not found in './lib/use-cases/create-production-order.use-case' (possible exports: CreateProductionOrderUseCase)
 @ ./libs/domain/manufacturing/presentation/src/lib/manufacturing-presentation.module.ts 4:0-91 10:18-48
 @ ./libs/domain/manufacturing/presentation/src/index.ts 1:0-56 1:0-56
 @ ./apps/api/manufacturing/app/src/app/app.module.ts 7:0-93 45:12-43
 @ ./apps/api/manufacturing/app/src/main.ts 3:0-45 6:41-50
WARNING in ./libs/domain/manufacturing/application/src/lib/use-cases/create-production-order.use-case.ts 64:57-82
... [intermedio] ...
Error: Could not find /app/dist/apps/api-manufacturing-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-manufacturing-app failed

Failed tasks:

- api-manufacturing-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-payroll-app

```

> nx run api-payroll-app:serve:development

assets by status 600 KiB [big]
  asset main.js 307 KiB [compared for emit] [big] (name: main) 1 related asset
  asset package-lock.json 293 KiB [compared for emit] [big]
asset package.json 1.74 KiB [compared for emit]
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/payroll/app/src/assets/.gitkeep] [copied]
orphan modules 289 KiB [orphan] 184 modules
runtime modules 937 bytes 4 modules
built modules 290 KiB [built]
  ./apps/api/payroll/app/src/main.ts + 182 modules 290 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/payroll/application/src/lib/use-cases/calculate-payroll.use-case.ts 57:23-42
export 'PayrollType' (imported as 'PayrollType') was not found in '@virteex/domain-payroll-contracts' (possible exports: CalculatePayrollDto)
 @ ./libs/domain/payroll/application/src/index.ts 2:0-59 2:0-59
 @ ./libs/domain/payroll/presentation/src/lib/payroll-presentation.module.ts 3:0-126 11:18-42 13:37-60 13:62-81 14:18-42
 @ ./libs/domain/payroll/presentation/src/index.ts 1:0-50 1:0-50
 @ ./apps/api/payroll/app/src/app/app.module.ts 7:0-81 45:12-37
 @ ./apps/api/payroll/app/src/main.ts 3:0-45 6:41-50
... [intermedio] ...
Error: Could not find /app/dist/apps/api-payroll-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-payroll-app failed

Failed tasks:

- api-payroll-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-plugin-host-app

```

 NX   Running target serve for project api-plugin-host-app and 8 tasks it depends on:



> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run domain-catalog-domain:build  [existing outputs match the cache, left as is]


> nx run platform-storage:build  [existing outputs match the cache, left as is]


> nx run kernel-auth:build  [existing outputs match the cache, left as is]


... [intermedio] ...
  21 |   global = {
  22 |     setSync: vi.fn(),
> 23 |     derefInto: vi.fn(),
     |                ^
  24 |   };
  25 |   release() {
  26 |     // Mock release
Found 3 errors.



 NX   Running target serve for project api-plugin-host-app and 8 tasks it depends on failed

Failed tasks:

- api-plugin-host-app:build:production

Hint: run the command with --verbose for more details.


```

### api-pos

```

> nx run api-pos:serve

> webpack-cli serve --node-env=development

<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8080/, http://[::1]:8080/
<i> [webpack-dev-server] On Your Network (IPv4): http://192.168.0.2:8080/
<i> [webpack-dev-server] Content not from webpack is served from '/app/apps/api/pos/app/public' directory
WARNING in ../../../../libs/domain/billing/application/src/lib/use-cases/add-payment-method.use-case.ts 19:57-80
export 'PaymentMethodRepository' (imported as 'PaymentMethodRepository') was not found in '@virteex/domain-billing-domain' (possible exports: BILLING_TAX_STRATEGY_FACTORY, BillingDomainModule, CUSTOMER_REPOSITORY, FiscalStampingService, INVOICE_REPOSITORY, Invoice, InvoiceItem, InvoiceStampedEvent, PAC_PROVIDER, PAC_STRATEGY_FACTORY, PAYMENT_METHOD_REPOSITORY, PAYMENT_PROVIDER, PRODUCT_REPOSITORY, PaymentMethod, TAX_RULE_REPOSITORY, TENANT_CONFIG_REPOSITORY, TaxCalculatorService, TaxLine, TaxRule, TaxRuleEngine, TaxStrategyFactory)

WARNING in ../../../../libs/domain/billing/application/src/lib/use-cases/add-payment-method.use-case.ts 19:100-123
export 'PaymentMethodRepository' (imported as 'PaymentMethodRepository') was not found in '@virteex/domain-billing-domain' (possible exports: BILLING_TAX_STRATEGY_FACTORY, BillingDomainModule, CUSTOMER_REPOSITORY, FiscalStampingService, INVOICE_REPOSITORY, Invoice, InvoiceItem, InvoiceStampedEvent, PAC_PROVIDER, PAC_STRATEGY_FACTORY, PAYMENT_METHOD_REPOSITORY, PAYMENT_PROVIDER, PRODUCT_REPOSITORY, PaymentMethod, TAX_RULE_REPOSITORY, TENANT_CONFIG_REPOSITORY, TaxCalculatorService, TaxLine, TaxRule, TaxRuleEngine, TaxStrategyFactory)

WARNING in ../../../../libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:57-74
export 'InvoiceRepository' (imported as 'InvoiceRepository') was not found in '@virteex/domain-billing-domain' (possible exports: BILLING_TAX_STRATEGY_FACTORY, BillingDomainModule, CUSTOMER_REPOSITORY, FiscalStampingService, INVOICE_REPOSITORY, Invoice, InvoiceItem, InvoiceStampedEvent, PAC_PROVIDER, PAC_STRATEGY_FACTORY, PAYMENT_METHOD_REPOSITORY, PAYMENT_PROVIDER, PRODUCT_REPOSITORY, PaymentMethod, TAX_RULE_REPOSITORY, TENANT_CONFIG_REPOSITORY, TaxCalculatorService, TaxLine, TaxRule, TaxRuleEngine, TaxStrategyFactory)

WARNING in ../../../../libs/domain/billing/application/src/lib/use-cases/create-invoice.use-case.ts 75:94-111
export 'InvoiceRepository' (imported as 'InvoiceRepository') was not found in '@virteex/domain-billing-domain' (possible exports: BILLING_TAX_STRATEGY_FACTORY, BillingDomainModule, CUSTOMER_REPOSITORY, FiscalStampingService, INVOICE_REPOSITORY, Invoice, InvoiceItem, InvoiceStampedEvent, PAC_PROVIDER, PAC_STRATEGY_FACTORY, PAYMENT_METHOD_REPOSITORY, PAYMENT_PROVIDER, PRODUCT_REPOSITORY, PaymentMethod, TAX_RULE_REPOSITORY, TENANT_CONFIG_REPOSITORY, TaxCalculatorService, TaxLine, TaxRule, TaxRuleEngine, TaxStrategyFactory)
... [intermedio] ...
    12 |
    13 |   async saveSale(sale: PosSale): Promise<void> {
  > 14 |     await this.dataQualityService.validatePosSaleInvariants(sale);
       |                                   ^^^^^^^^^^^^^^^^^^^^^^^^^
    15 |     await this.em.persistAndFlush(sale);
    16 |   }
    17 |

ERROR in ../../../../libs/platform/xslt/src/lib/xslt.service.ts:4:33
TS2307: Cannot find module 'xslt-processor' or its corresponding type declarations.
    2 | import * as fs from 'fs';
    3 | import * as path from 'path';
  > 4 | import { XmlParser, Xslt } from 'xslt-processor';
      |                                 ^^^^^^^^^^^^^^^^
    5 |
    6 | @Injectable()
    7 | export class XsltService {

Found 91 errors in 9531 ms.

```

### api-projects-app

```

> nx run api-projects-app:serve:development

assets by path *.json 292 KiB
  asset package-lock.json 290 KiB [compared for emit] [big]
  asset package.json 1.61 KiB [compared for emit]
asset main.js 226 KiB [compared for emit] (name: main) 1 related asset
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/projects/app/src/assets/.gitkeep] [copied]
orphan modules 212 KiB [orphan] 130 modules
runtime modules 937 bytes 4 modules
built modules 212 KiB [built]
  ./apps/api/projects/app/src/main.ts + 128 modules 212 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/projects/application/src/lib/use-cases/create-project.use-case.ts 27:57-74
export 'ProjectRepository' (imported as 'ProjectRepository') was not found in '@virteex/domain-projects-domain' (possible exports: PROJECT_REPOSITORY, Project, Task)
 @ ./libs/domain/projects/application/src/index.ts 2:0-56 2:0-56
 @ ./libs/domain/projects/presentation/src/lib/projects-presentation.module.ts 4:0-81 10:18-43
 @ ./libs/domain/projects/presentation/src/index.ts 1:0-51 1:0-51
 @ ./apps/api/projects/app/src/app/app.module.ts 7:0-83 45:12-38
 @ ./apps/api/projects/app/src/main.ts 3:0-45 6:41-50
... [intermedio] ...
Error: Could not find /app/dist/apps/api-projects-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-projects-app failed

Failed tasks:

- api-projects-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-purchasing-app

```

> nx run api-purchasing-app:serve:development

assets by status 557 KiB [big]
  asset package-lock.json 290 KiB [compared for emit] [big]
  asset main.js 267 KiB [compared for emit] [big] (name: main) 1 related asset
asset package.json 1.62 KiB [compared for emit]
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/purchasing/app/src/assets/.gitkeep] [copied]
orphan modules 245 KiB [orphan] 158 modules
runtime modules 937 bytes 4 modules
built modules 246 KiB [built]
  ./apps/api/purchasing/app/src/main.ts + 153 modules 245 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/purchasing/application/src/lib/use-cases/approve-requisition.use-case.ts 27:57-78
export 'RequisitionRepository' (imported as 'RequisitionRepository') was not found in '@virteex/domain-purchasing-domain' (possible exports: PURCHASE_ORDER_REPOSITORY, PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus, REQUISITION_REPOSITORY, Requisition, SUPPLIER_REPOSITORY, Supplier, SupplierType, VENDOR_BILL_REPOSITORY, VendorBill)
 @ ./libs/domain/purchasing/application/src/lib/index.ts 5:0-57 5:0-57
 @ ./libs/domain/purchasing/application/src/index.ts 1:0-28 1:0-28
 @ ./libs/domain/purchasing/presentation/src/lib/purchasing-presentation.module.ts 6:0-311 12:18-45 15:12-33 16:12-38 17:12-36 18:12-34 19:12-37 20:12-36 21:12-35 22:12-35 23:12-32 26:18-45
 @ ./libs/domain/purchasing/presentation/src/index.ts 1:0-53 1:0-53
 @ ./apps/api/purchasing/app/src/app/app.module.ts 7:0-87 45:12-40
... [intermedio] ...
Error: Could not find /app/dist/apps/api-purchasing-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-purchasing-app failed

Failed tasks:

- api-purchasing-app:serve:development

Hint: run the command with --verbose for more details.


```

### api-subscription-app

```

 NX   Running target serve for project api-subscription-app and 11 tasks it depends on:



> nx run domain-subscription-domain:build  [existing outputs match the cache, left as is]


> nx run kernel-tenant-context:build  [existing outputs match the cache, left as is]


> nx run kernel-telemetry-interfaces:build  [existing outputs match the cache, left as is]


> nx run kernel-auth:build  [existing outputs match the cache, left as is]


> nx run shared-util-server-server-config:build  [existing outputs match the cache, left as is]


... [intermedio] ...
> nx run domain-subscription-contracts:build

Compiling TypeScript files for project "domain-subscription-contracts"...
node_modules/@types/request/index.d.ts:389:84 - error TS2724: '"/app/node_modules/tough-cookie/dist/index"' has no exported member named 'CookieJar'. Did you mean 'Cookie'?

389         setCookie(cookieOrStr: Cookie | string, uri: string | Url, options?: tough.CookieJar.SetCookieOptions): void;
                                                                                       ~~~~~~~~~




 NX   Running target serve for project api-subscription-app and 11 tasks it depends on failed

Failed tasks:

- domain-subscription-contracts:build

Hint: run the command with --verbose for more details.


```

### api-treasury-app

```

> nx run api-treasury-app:serve:development

assets by status 544 KiB [big]
  asset package-lock.json 290 KiB [compared for emit] [big]
  asset main.js 254 KiB [compared for emit] [big] (name: main) 1 related asset
asset package.json 1.61 KiB [compared for emit]
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/api/treasury/app/src/assets/.gitkeep] [copied]
orphan modules 233 KiB [orphan] 146 modules
runtime modules 937 bytes 4 modules
built modules 234 KiB [built]
  ./apps/api/treasury/app/src/main.ts + 144 modules 233 KiB [not cacheable] [built] [code generated]
  external "express" 42 bytes [built] [code generated]
WARNING in ./libs/domain/treasury/application/src/lib/use-cases/create-bank-account.use-case.ts 32:57-78
export 'BankAccountRepository' (imported as 'BankAccountRepository') was not found in '@virteex/domain-treasury-domain' (possible exports: BANK_ACCOUNT_REPOSITORY, BankAccount, CashFlow, TRANSACTION_REPOSITORY, Transaction, TransactionType, treasuryDomain)
 @ ./libs/domain/treasury/application/src/index.ts 2:0-61 2:0-61
 @ ./libs/domain/treasury/presentation/src/lib/treasury-presentation.module.ts 3:0-81 11:18-43
 @ ./libs/domain/treasury/presentation/src/index.ts 1:0-51 1:0-51
 @ ./apps/api/treasury/app/src/app/app.module.ts 7:0-83 45:12-38
 @ ./apps/api/treasury/app/src/main.ts 3:0-45 6:41-50
... [intermedio] ...
Error: Could not find /app/dist/apps/api-treasury-app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1



 NX   Running target serve for project api-treasury-app failed

Failed tasks:

- api-treasury-app:serve:development

Hint: run the command with --verbose for more details.


```

### worker-notification-app

```

 NX   Running target serve for project worker-notification-app and 1 task it depends on:



> nx run worker-notification-app:build:production

assets by path *.json 189 KiB
  asset package-lock.json 188 KiB [compared for emit]
  asset package.json 1000 bytes [compared for emit]
asset main.js 94.4 KiB [compared for emit] [minimized] (name: main) 1 related asset
asset 3rdpartylicenses.txt 185 bytes [compared for emit]
asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/worker/notification/app/src/assets/.gitkeep] [copied]
orphan modules 180 KiB [orphan] 89 modules
runtime modules 937 bytes 4 modules
./apps/worker/notification/app/src/main.ts + 87 modules 181 KiB [not cacheable] [built] [code generated]
WARNING in ./apps/worker/notification/app/src/app/notification.consumer.ts 112:57-69
export 'EmailService' (imported as 'EmailService') was not found in '@virteex/domain-notification-infrastructure' (possible exports: NotificationInfrastructureModule)
 @ ./apps/worker/notification/app/src/app/app.module.ts 6:0-63 32:37-57
 @ ./apps/worker/notification/app/src/main.ts 3:0-45 5:41-50
... [intermedio] ...
     8 |   TenantContextValidationError,
     9 | } from '@virteex/kernel-auth';
  > 10 | import { EmailService, SmsService, PushNotificationService } from '@virteex/domain-notification-infrastructure';
       |                                    ^^^^^^^^^^^^^^^^^^^^^^^
    11 |
    12 | type TenantPayload = { tenantId: string; region?: string; currency?: string; language?: string };
    13 |
webpack 5.104.1 compiled with 3 errors and 8 warnings in 5995 ms



 NX   Running target serve for project worker-notification-app and 1 task it depends on failed

Failed tasks:

- worker-notification-app:build:production

Hint: run the command with --verbose for more details.


```

### worker-scheduler-app

```

 NX   Running target serve for project worker-scheduler-app and 1 task it depends on:



> nx run worker-scheduler-app:build:production

assets by status 141 KiB [compared for emit]
  asset package-lock.json 141 KiB [compared for emit]
  asset package.json 859 bytes [compared for emit]
  asset assets/.gitkeep 0 bytes [compared for emit] [from: apps/worker/scheduler/app/src/assets/.gitkeep] [copied]
assets by status 109 KiB [emitted]
  asset main.js 109 KiB [emitted] [minimized] (name: main) 1 related asset
  asset 3rdpartylicenses.txt 198 bytes [emitted]
orphan modules 214 KiB [orphan] 119 modules
runtime modules 937 bytes 4 modules
./apps/worker/scheduler/app/src/main.ts + 117 modules 215 KiB [not cacheable] [built] [code generated]
WARNING in ./libs/kernel/auth/src/lib/services/secret-manager.service.ts 86:57-71
export 'SecretProvider' (imported as 'SecretProvider') was not found in '../interfaces/secret-provider.interface' (module has no exports)
 @ ./libs/kernel/auth/src/index.ts 9:0-54 9:0-54
... [intermedio] ...
webpack 5.104.1 compiled with 2 warnings in 5958 ms
/app/node_modules/@nx/js/src/executors/node/node.impl.js:359
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
          ^
Error: Could not find /app/dist/apps/worker/scheduler/app/main.js. Make sure your build succeeded.
    at fileToRunCorrectPath (/app/node_modules/@nx/js/src/executors/node/node.impl.js:359:11)
    at /app/node_modules/@nx/js/src/executors/node/node.impl.js:122:49
    at new Promise (<anonymous>)
    at Object.start (/app/node_modules/@nx/js/src/executors/node/node.impl.js:113:36)
    at async processQueue (/app/node_modules/@nx/js/src/executors/node/node.impl.js:78:13)
    at async Timeout.<anonymous> (/app/node_modules/@nx/js/src/executors/node/lib/coalescing-debounce.js:24:40)
Node.js v22.22.1
Task "worker-scheduler-app:serve:development" is continuous but exited with code 1



 NX   Successfully ran target serve for project worker-scheduler-app and 1 task it depends on



```

### web-portal-app

```

> nx run web-portal-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [5.879 seconds] - 2026-03-13T13:31:02.000Z

✘ [ERROR] TS2305: Module '"@virteex/shared-util-auth"' has no exported member 'authInterceptor'. [plugin angular-compiler]
    apps/web/portal/app/src/app/app.config.ts:13:9:
      13 │ import { authInterceptor } from '@virteex/shared-util-auth';
         ╵          ~~~~~~~~~~~~~~~
✘ [ERROR] TS2307: Cannot find module '@virteex/shared-util-http' or its corresponding type declarations. [plugin angular-compiler]
    apps/web/portal/app/src/app/app.config.ts:15:35:
      15 │ import { loadingInterceptor } from '@virteex/shared-util-http';
         ╵                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2305: Module '"@virteex/shared-util-auth"' has no exported member 'authGuard'. [plugin angular-compiler]
    apps/web/portal/app/src/app/app.routes.ts:3:9:
      3 │ import { authGuard } from '@virteex/shared-util-auth';
        ╵          ~~~~~~~~~
✘ [ERROR] TS2307: Cannot find module '@virteex/identity-ui' or its corresponding type declarations. [plugin angular-compiler]
... [intermedio] ...
         ╵                            ~~~~~~~~~~~~~~~~
✘ [ERROR] TS2307: Cannot find module '@virteex/admin-ui' or its corresponding type declarations. [plugin angular-compiler]
    apps/web/portal/app/src/app/app.routes.ts:40:50:
      40 │ ...hildren: () => import('@virteex/admin-ui').then(m => m.adminRou...
         ╵                          ~~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2307: Cannot find module '@virteex/fiscal-ui' or its corresponding type declarations. [plugin angular-compiler]
    apps/web/portal/app/src/app/app.routes.ts:41:51:
      41 │ ...hildren: () => import('@virteex/fiscal-ui').then(m => m.fiscalR...
         ╵                          ~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2353: Object literal may only specify known properties, and 'recaptcha' does not exist in type 'AppConfig'. [plugin angular-compiler]
    apps/web/portal/app/src/environments/environment.prod.ts:6:2:
      6 │   recaptcha: {
        ╵   ~~~~~~~~~
✘ [ERROR] TS2353: Object literal may only specify known properties, and 'recaptcha' does not exist in type 'AppConfig'. [plugin angular-compiler]
    apps/web/portal/app/src/environments/environment.ts:6:2:
      6 │   recaptcha: {
        ╵   ~~~~~~~~~

Watch mode enabled. Watching for file changes...

```

### web-shopfloor-app

```

> nx run web-shopfloor-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [0.911 seconds] - 2026-03-13T13:32:03.891Z

▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web-shopfloor-app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
  To control ECMA version and features use the Browserslist configuration. For more information, see https://angular.dev/tools/cli/build#configuring-browser-compatibility

✘ [ERROR] Cannot find tsconfig file "apps/web-shopfloor-app/tsconfig.app.json"
✘ [ERROR] TS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-shopfloor-app/tsconfig.app.json'
    at Object.lstatSync (node:fs:1722:25)
    at NodeJSFileSystem.lstat (file:///app/node_modules/@angular/compiler-cli/bundles/chunk-XYYEESKY.js:73:15)
    at calcProjectFileAndBasePath (file:///app/node_modules/@angular/compiler-cli/bundles/chunk-3LTGCVHM.js:448:29)
    at readConfiguration (file:///app/node_modules/@angular/compiler-cli/bundles/chunk-3LTGCVHM.js:474:39)
    at /app/node_modules/@angular/build/src/tools/angular/compilation/angular-compilation.js:67:69
    at profileSync (/app/node_modules/@angular/build/src/tools/esbuild/profiling.js:68:16)
    at AotCompilation.loadConfiguration (/app/node_modules/@angular/build/src/tools/angular/compilation/angular-compilation.js:67:44)
    at async AotCompilation.initialize (/app/node_modules/@angular/build/src/tools/angular/compilation/aot-compilation.js:62:100)
    at async initialize (/app/node_modules/@angular/build/src/tools/angular/compilation/parallel-worker.js:38:121)
    at async onMessage (/app/node_modules/piscina/dist/worker.js:180:22) [plugin angular-compiler]
✘ [ERROR] Could not resolve "/app/apps/web-shopfloor-app/src/main.ts"
✘ [ERROR] Could not resolve "apps/web-shopfloor-app/src/styles.scss"
    angular:styles/global:styles:1:8:
      1 │ @import 'apps/web-shopfloor-app/src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  You can mark the path "apps/web-shopfloor-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.

Watch mode enabled. Watching for file changes...

```

### web-support-app

```

> nx run web-support-app:serve:development

❯ Building...
✔ Building...
Initial chunk files | Names         |  Raw size
main.js             | main          |   5.32 kB |
styles.css          | styles        | 117 bytes |
                    | Initial total |   5.43 kB
Application bundle generation complete. [2.992 seconds] - 2026-03-13T13:32:53.404Z

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4203/

```

### web-store-app

```

> nx run web-store-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [0.881 seconds] - 2026-03-13T13:33:35.937Z

▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web-store-app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
  To control ECMA version and features use the Browserslist configuration. For more information, see https://angular.dev/tools/cli/build#configuring-browser-compatibility
▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web-store-app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
... [intermedio] ...
✘ [ERROR[41;31m] Could not resolve "/app/apps/web-store-app/src/main.ts"
✘ [ERROR] Cannot find tsconfig file "apps/web-store-app/tsconfig.app.json"
✘ [ERROR] Could not resolve "./apps/web-store-app/src/main.server"
    angular:main-server:angular:main-server:8:24:
      8 │ export { default } from './apps/web-store-app/src/main.server';
        ╵                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] Cannot find tsconfig file "apps/web-store-app/tsconfig.app.json"
✘ [ERROR] Could not resolve "./apps/web-store-app/src/server"
    angular:ssr-entry:angular:ssr-entry:2:24:
      2 │ import * as server from './apps/web-store-app/src/server';
        ╵                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] Could not resolve "apps/web-store-app/src/styles.scss"
    angular:styles/global:styles:1:8:
      1 │ @import 'apps/web-store-app/src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  You can mark the path "apps/web-store-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.
✘ [ERROR] Cannot find tsconfig file "apps/web-store-app/tsconfig.app.json"

Watch mode enabled. Watching for file changes...

```

### web-site-app

```

> nx run web-site-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [1.126 seconds] - 2026-03-13T13:34:21.363Z

▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web-site-app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
  To control ECMA version and features use the Browserslist configuration. For more information, see https://angular.dev/tools/cli/build#configuring-browser-compatibility
▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web-site-app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
... [intermedio] ...
✘ [ERROR[41;31m] Could not resolve "/app/apps/web-site-app/src/main.ts"
✘ [ERROR] Cannot find tsconfig file "apps/web-site-app/tsconfig.app.json"
✘ [ERROR] Could not resolve "./apps/web-site-app/src/main.server"
    angular:main-server:angular:main-server:8:24:
      8 │ export { default } from './apps/web-site-app/src/main.server';
        ╵                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] Cannot find tsconfig file "apps/web-site-app/tsconfig.app.json"
✘ [ERROR] Could not resolve "./apps/web-site-app/src/server"
    angular:ssr-entry:angular:ssr-entry:2:24:
      2 │ import * as server from './apps/web-site-app/src/server';
        ╵                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] Could not resolve "apps/web-site-app/src/styles.scss"
    angular:styles/global:styles:1:8:
      1 │ @import 'apps/web-site-app/src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  You can mark the path "apps/web-site-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.
✘ [ERROR] Cannot find tsconfig file "apps/web-site-app/tsconfig.app.json"

Watch mode enabled. Watching for file changes...

```

### web-cms-app

```

> nx run web-cms-app:serve:development

❯ Building...
✔ Building...
Initial chunk files | Names         |  Raw size
main.js             | main          |   5.27 kB |
styles.css          | styles        | 113 bytes |
                    | Initial total |   5.38 kB
Application bundle generation complete. [5.495 seconds] - 2026-03-13T13:35:11.164Z

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4201/

```

### web-ops-app

```

> nx run web-ops-app:serve:development

❯ Building...
✔ Building...
Initial chunk files | Names                    |  Raw size
main.js             | main                     |  40.88 kB |
chunk-WAB2FOVT.js   | -                        | 236 bytes |
styles.css          | styles                   | 113 bytes |
                    | Initial total            |  41.23 kB
Lazy chunk files    | Names                    |  Raw size
chunk-ZLCQMW7W.js   | create-tenant-component  |  17.44 kB |
chunk-F7RASMBZ.js   | tenants-component        |  12.48 kB |
chunk-FYPNO3MY.js   | dashboard-component      |  11.66 kB |
chunk-4SOFMUF6.js   | billing-component        |   8.28 kB |
chunk-LLEMN4YS.js   | console-config-component |   3.68 kB |
chunk-QM55HVRA.js   | notifications-component  |   3.67 kB |
chunk-Q2OB2KX7.js   | import-export-component  |   3.65 kB |
chunk-4IEDYSS5.js   | feature-flags-component  |   3.65 kB |
chunk-LRSPUDKT.js   | automation-component     |   3.57 kB |
chunk-B6PQKI32.js   | monitoring-component     |   3.57 kB |
chunk-W3HY7F3T.js   | databases-component      |   3.54 kB |
chunk-WM7KPXBY.js   | releases-component       |   3.51 kB |
chunk-KH4S46GB.js   | security-component       |   3.51 kB |
chunk-QUUUCD3C.js   | storage-component        |   3.48 kB |
chunk-W3BPYUVU.js   | backups-component        |   3.48 kB |
...and 9 more lazy chunks files. Use "--verbose" to show all the files.
Application bundle generation complete. [7.323 seconds] - 2026-03-13T13:35:58.146Z

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4202/

```

### web-pos-app

```

> nx run web-pos-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [4.611 seconds] - 2026-03-13T13:36:41.143Z

▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web/pos/app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
  To control ECMA version and features use the Browserslist configuration. For more information, see https://angular.dev/tools/cli/build#configuring-browser-compatibility
▲ [WARNING] Cannot find base config file "../../../tsconfig.base.json" [tsconfig.json]
    apps/web/pos/app/tsconfig.app.json:2:13:
      2 │   "extends": "../../../tsconfig.base.json",
        ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

✘ [ERROR] TS5012: Cannot read file '/app/apps/tsconfig.base.json': ENOENT: no such file or directory, open '/app/apps/tsconfig.base.json'. [plugin angular-compiler]

Watch mode enabled. Watching for file changes...

```

### web-wms-app

```

> nx run web-wms-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [1.963 seconds] - 2026-03-13T13:37:24.058Z

▲ [WARNING] TypeScript compiler options 'module' values 'CommonJS', 'UMD', 'System' and 'AMD' are not supported. [plugin angular-compiler]
  The 'module' option will be set to 'ES2022' instead.
▲ [WARNING] TypeScript compiler options 'target' and 'useDefineForClassFields' are set to 'ES2022' and 'false' respectively by the Angular CLI. [plugin angular-compiler]
    apps/web-wms-app/tsconfig.app.json:0:0:
      0 │
        ╵ ^
  To control ECMA version and features use the Browserslist configuration. For more information, see https://angular.dev/tools/cli/build#configuring-browser-compatibility

✘ [ERROR] Cannot find tsconfig file "apps/web-wms-app/tsconfig.app.json"
✘ [ERROR] TS500: Error: ENOENT: no such file or directory, lstat '/app/apps/web-wms-app/tsconfig.app.json'
    at Object.lstatSync (node:fs:1722:25)
    at NodeJSFileSystem.lstat (file:///app/node_modules/@angular/compiler-cli/bundles/chunk-XYYEESKY.js:73:15)
    at calcProjectFileAndBasePath (file:///app/node_modules/@angular/compiler-cli/bundles/chunk-3LTGCVHM.js:448:29)
    at readConfiguration (file:///app/node_modules/@angular/compiler-cli/bundles/chunk-3LTGCVHM.js:474:39)
    at /app/node_modules/@angular/build/src/tools/angular/compilation/angular-compilation.js:67:69
    at profileSync (/app/node_modules/@angular/build/src/tools/esbuild/profiling.js:68:16)
    at AotCompilation.loadConfiguration (/app/node_modules/@angular/build/src/tools/angular/compilation/angular-compilation.js:67:44)
    at async AotCompilation.initialize (/app/node_modules/@angular/build/src/tools/angular/compilation/aot-compilation.js:62:100)
    at async initialize (/app/node_modules/@angular/build/src/tools/angular/compilation/parallel-worker.js:38:121)
    at async onMessage (/app/node_modules/piscina/dist/worker.js:180:22) [plugin angular-compiler]
✘ [ERROR] Could not resolve "/app/apps/web-wms-app/src/main.ts"
✘ [ERROR] Could not resolve "apps/web-wms-app/src/styles.scss"
    angular:styles/global:styles:1:8:
      1 │ @import 'apps/web-wms-app/src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  You can mark the path "apps/web-wms-app/src/styles.scss" as external to exclude it from the bundle, which will remove this error and leave the unresolved path in the bundle.

Watch mode enabled. Watching for file changes...

```

### mobile-app

```

> nx run mobile-app:serve:development

❯ Building...
✔ Building...
Application bundle generation failed. [4.560 seconds] - 2026-03-13T13:38:50.621Z

✘ [ERROR] TS2305: Module '"@virteex/shared-util-auth"' has no exported member 'SecureStorageService'. [plugin angular-compiler]
    apps/mobile/app/src/app/core/interceptors/auth.interceptor.ts:4:9:
      4 │ import { SecureStorageService } from '@virteex/shared-util-auth';
        ╵          ~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS18046: 'secureStorage' is of type 'unknown'. [plugin angular-compiler]
    apps/mobile/app/src/app/core/interceptors/auth.interceptor.ts:18:14:
      18 │   return from(secureStorage.get('access_token')).pipe(
         ╵               ~~~~~~~~~~~~~
✘ [ERROR] TS2305: Module '"@virteex/shared-util-auth"' has no exported member 'SecureStorageService'. [plugin angular-compiler]
    apps/mobile/app/src/app/core/services/database.service.ts:6:9:
      6 │ import { SecureStorageService } from '@virteex/shared-util-auth';
        ╵          ~~~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]
... [intermedio] ...
         ╵                       ~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]
    apps/mobile/app/src/app/pages/login/login.page.ts:74:22:
      74 │                 await this.secureStorage.set('refresh_token', res....
         ╵                       ~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]
    apps/mobile/app/src/app/pages/login/login.page.ts:77:12:
      77 │             this.sessionService.login();
         ╵             ~~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]
    apps/mobile/app/src/app/pages/login/login.page.ts:82:33:
      82 │ ...       const token = await this.secureStorage.get('access_token');
         ╵                               ~~~~~~~~~~~~~~~~~~
✘ [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]
    apps/mobile/app/src/app/pages/login/login.page.ts:85:17:
      85 │                  this.sessionService.login();
         ╵                  ~~~~~~~~~~~~~~~~~~~

Watch mode enabled. Watching for file changes...

```

### desktop-app

```

> nx run desktop-app:serve

asset main.js 19.7 KiB [emitted] (name: main) 1 related asset
asset main.preload.js 3.82 KiB [emitted] (name: main.preload) 1 related asset
asset assets/gitkeep_tmpl_ 13 bytes [emitted] [from: apps/desktop/app/src/assets/gitkeep_tmpl_] [copied]
runtime modules 1.83 KiB 8 modules
built modules 9.82 KiB [built]
  cacheable modules 9.61 KiB
    modules by path ./apps/desktop/app/src/app/ 8.59 KiB
      modules by path ./apps/desktop/app/src/app/api/*.ts 1.03 KiB 2 modules
      modules by path ./apps/desktop/app/src/app/events/*.ts 2.54 KiB 2 modules
      modules by path ./apps/desktop/app/src/app/*.ts 5.01 KiB 2 modules
    ./apps/desktop/app/src/main.ts 959 bytes [built] [code generated]
    ./apps/desktop/app/src/environments/environment.ts 87 bytes [built] [code generated]
  external "electron" 42 bytes [built] [code generated]
  external "child_process" 42 bytes [built] [code generated]
  external "path" 42 bytes [built] [code generated]
  external "url" 42 bytes [built] [code generated]
  external "fs/promises" 42 bytes [built] [code generated]
webpack 5.104.1 compiled successfully in 556 ms
Type-checking in progress...
Debugger listening on ws://127.0.0.1:5858/2eb924c1-11a9-42bb-8dee-c1d789c57e0d
For help, see: https://nodejs.org/en/docs/inspector

[12961:0313/133934.919776:ERROR:ozone_platform_x11.cc(246)] Missing X server or $DISPLAY
[12961:0313/133934.919843:ERROR:env.cc(257)] The platform failed to initialize.  Exiting.

No typescript errors found.

```
