import json
import os
import subprocess
import re

# Full migration map
mapping = [
  {"old_path": "libs/domains/notification/ui", "old_id": "notification-ui", "new_path": "libs/domain/notification/ui", "new_id": "domain-notification-ui"},
  {"old_path": "libs/domains/billing/infrastructure", "old_id": "infra-billing-infrastructure", "new_path": "libs/domain/billing/infrastructure", "new_id": "domain-billing-infrastructure"},
  {"old_path": "libs/domains/billing/application", "old_id": "application-billing-application", "new_path": "libs/domain/billing/application", "new_id": "domain-billing-application"},
  {"old_path": "libs/domains/billing/domain", "old_id": "domain-billing-domain", "new_path": "libs/domain/billing/domain", "new_id": "domain-billing-domain"},
  {"old_path": "libs/domains/billing/presentation", "old_id": "billing-presentation", "new_path": "libs/domain/billing/presentation", "new_id": "domain-billing-presentation"},
  {"old_path": "libs/domains/purchasing/contracts", "old_id": "contracts-purchasing-contracts", "new_path": "libs/domain/purchasing/contracts", "new_id": "domain-purchasing-contracts"},
  {"old_path": "libs/domains/purchasing/infrastructure", "old_id": "infra-purchasing-infrastructure", "new_path": "libs/domain/purchasing/infrastructure", "new_id": "domain-purchasing-infrastructure"},
  {"old_path": "libs/domains/purchasing/application", "old_id": "application-purchasing-application", "new_path": "libs/domain/purchasing/application", "new_id": "domain-purchasing-application"},
  {"old_path": "libs/domains/purchasing/domain", "old_id": "domain-purchasing-domain", "new_path": "libs/domain/purchasing/domain", "new_id": "domain-purchasing-domain"},
  {"old_path": "libs/domains/purchasing/presentation", "old_id": "api-purchasing-presentation", "new_path": "libs/domain/purchasing/presentation", "new_id": "domain-purchasing-presentation"},
  {"old_path": "libs/domains/crm/contracts", "old_id": "contracts-crm-contracts", "new_path": "libs/domain/crm/contracts", "new_id": "domain-crm-contracts"},
  {"old_path": "libs/domains/crm/infrastructure", "old_id": "infra-crm-infrastructure", "new_path": "libs/domain/crm/infrastructure", "new_id": "domain-crm-infrastructure"},
  {"old_path": "libs/domains/crm/application", "old_id": "application-crm-application", "new_path": "libs/domain/crm/application", "new_id": "domain-crm-application"},
  {"old_path": "libs/domains/crm/domain", "old_id": "domain-crm-domain", "new_path": "libs/domain/crm/domain", "new_id": "domain-crm-domain"},
  {"old_path": "libs/domains/crm/presentation", "old_id": "api-crm-presentation", "new_path": "libs/domain/crm/presentation", "new_id": "domain-crm-presentation"},
  {"old_path": "libs/domains/bi/contracts", "old_id": "contracts-bi-contracts", "new_path": "libs/domain/bi/contracts", "new_id": "domain-bi-contracts"},
  {"old_path": "libs/domains/bi/infrastructure", "old_id": "infra-bi-infrastructure", "new_path": "libs/domain/bi/infrastructure", "new_id": "domain-bi-infrastructure"},
  {"old_path": "libs/domains/bi/application", "old_id": "application-bi-application", "new_path": "libs/domain/bi/application", "new_id": "domain-bi-application"},
  {"old_path": "libs/domains/bi/domain", "old_id": "domain-bi-domain", "new_path": "libs/domain/bi/domain", "new_id": "domain-bi-domain"},
  {"old_path": "libs/domains/bi/presentation", "old_id": "api-bi-presentation", "new_path": "libs/domain/bi/presentation", "new_id": "domain-bi-presentation"},
  {"old_path": "libs/domains/subscription/infrastructure", "old_id": "infra-subscription-infrastructure", "new_path": "libs/domain/subscription/infrastructure", "new_id": "domain-subscription-infrastructure"},
  {"old_path": "libs/domains/subscription/application", "old_id": "application-subscription-application", "new_path": "libs/domain/subscription/application", "new_id": "domain-subscription-application"},
  {"old_path": "libs/domains/subscription/domain", "old_id": "domain-subscription-domain", "new_path": "libs/domain/subscription/domain", "new_id": "domain-subscription-domain"},
  {"old_path": "libs/domains/subscription/presentation", "old_id": "api-subscription-presentation", "new_path": "libs/domain/subscription/presentation", "new_id": "domain-subscription-presentation"},
  {"old_path": "libs/domains/payroll/contracts", "old_id": "contracts-payroll-contracts", "new_path": "libs/domain/payroll/contracts", "new_id": "domain-payroll-contracts"},
  {"old_path": "libs/domains/payroll/infrastructure", "old_id": "infra-payroll-infrastructure", "new_path": "libs/domain/payroll/infrastructure", "new_id": "domain-payroll-infrastructure"},
  {"old_path": "libs/domains/payroll/application", "old_id": "application-payroll-application", "new_path": "libs/domain/payroll/application", "new_id": "domain-payroll-application"},
  {"old_path": "libs/domains/payroll/domain", "old_id": "domain-payroll-domain", "new_path": "libs/domain/payroll/domain", "new_id": "domain-payroll-domain"},
  {"old_path": "libs/domains/payroll/presentation", "old_id": "api-payroll-presentation", "new_path": "libs/domain/payroll/presentation", "new_id": "domain-payroll-presentation"},
  {"old_path": "libs/domains/manufacturing/contracts", "old_id": "contracts-manufacturing-contracts", "new_path": "libs/domain/manufacturing/contracts", "new_id": "domain-manufacturing-contracts"},
  {"old_path": "libs/domains/manufacturing/infrastructure", "old_id": "infra-manufacturing-infrastructure", "new_path": "libs/domain/manufacturing/infrastructure", "new_id": "domain-manufacturing-infrastructure"},
  {"old_path": "libs/domains/manufacturing/ui-shopfloor", "old_id": "manufacturing-ui-shopfloor", "new_path": "libs/domain/manufacturing/ui-shopfloor", "new_id": "domain-manufacturing-ui-shopfloor"},
  {"old_path": "libs/domains/manufacturing/application", "old_id": "application-manufacturing-application", "new_path": "libs/domain/manufacturing/application", "new_id": "domain-manufacturing-application"},
  {"old_path": "libs/domains/manufacturing/domain", "old_id": "domain-manufacturing-domain", "new_path": "libs/domain/manufacturing/domain", "new_id": "domain-manufacturing-domain"},
  {"old_path": "libs/domains/manufacturing/presentation", "old_id": "api-manufacturing-presentation", "new_path": "libs/domain/manufacturing/presentation", "new_id": "domain-manufacturing-presentation"},
  {"old_path": "libs/domains/inventory/contracts", "old_id": "contracts-inventory-contracts", "new_path": "libs/domain/inventory/contracts", "new_id": "domain-inventory-contracts"},
  {"old_path": "libs/domains/inventory/infrastructure", "old_id": "infra-inventory-infrastructure", "new_path": "libs/domain/inventory/infrastructure", "new_id": "domain-inventory-infrastructure"},
  {"old_path": "libs/domains/inventory/application", "old_id": "application-inventory-application", "new_path": "libs/domain/inventory/application", "new_id": "domain-inventory-application"},
  {"old_path": "libs/domains/inventory/ui-wms", "old_id": "inventory-ui-wms", "new_path": "libs/domain/inventory/ui-wms", "new_id": "domain-inventory-ui-wms"},
  {"old_path": "libs/domains/inventory/domain", "old_id": "domain-inventory-domain", "new_path": "libs/domain/inventory/domain", "new_id": "domain-inventory-domain"},
  {"old_path": "libs/domains/inventory/presentation", "old_id": "api-inventory-presentation", "new_path": "libs/domain/inventory/presentation", "new_id": "domain-inventory-presentation"},
  {"old_path": "libs/domains/admin/contracts", "old_id": "contracts-admin-contracts", "new_path": "libs/domain/admin/contracts", "new_id": "domain-admin-contracts"},
  {"old_path": "libs/domains/admin/infrastructure", "old_id": "infra-admin-infrastructure", "new_path": "libs/domain/admin/infrastructure", "new_id": "domain-admin-infrastructure"},
  {"old_path": "libs/domains/admin/application", "old_id": "application-admin-application", "new_path": "libs/domain/admin/application", "new_id": "domain-admin-application"},
  {"old_path": "libs/domains/admin/domain", "old_id": "domain-admin-domain", "new_path": "libs/domain/admin/domain", "new_id": "domain-admin-domain"},
  {"old_path": "libs/domains/admin/presentation", "old_id": "api-admin-presentation", "new_path": "libs/domain/admin/presentation", "new_id": "domain-admin-presentation"},
  {"old_path": "libs/domains/identity/contracts", "old_id": "contracts-identity-contracts", "new_path": "libs/domain/identity/contracts", "new_id": "domain-identity-contracts"},
  {"old_path": "libs/domains/identity/infrastructure", "old_id": "infra-identity-infrastructure", "new_path": "libs/domain/identity/infrastructure", "new_id": "domain-identity-infrastructure"},
  {"old_path": "libs/domains/identity/application", "old_id": "application-identity-application", "new_path": "libs/domain/identity/application", "new_id": "domain-identity-application"},
  {"old_path": "libs/domains/identity/domain", "old_id": "domain-identity-domain", "new_path": "libs/domain/identity/domain", "new_id": "domain-identity-domain"},
  {"old_path": "libs/domains/identity/ui", "old_id": "identity-ui", "new_path": "libs/domain/identity/ui", "new_id": "domain-identity-ui"},
  {"old_path": "libs/domains/identity/presentation", "old_id": "api-identity-presentation", "new_path": "libs/domain/identity/presentation", "new_id": "domain-identity-presentation"},
  {"old_path": "libs/domains/fixed-assets/contracts", "old_id": "contracts-fixed-assets-contracts", "new_path": "libs/domain/fixed-assets/contracts", "new_id": "domain-fixed-assets-contracts"},
  {"old_path": "libs/domains/fixed-assets/infrastructure", "old_id": "infra-fixed-assets-infrastructure", "new_path": "libs/domain/fixed-assets/infrastructure", "new_id": "domain-fixed-assets-infrastructure"},
  {"old_path": "libs/domains/fixed-assets/application", "old_id": "application-fixed-assets-application", "new_path": "libs/domain/fixed-assets/application", "new_id": "domain-fixed-assets-application"},
  {"old_path": "libs/domains/fixed-assets/domain", "old_id": "domain-fixed-assets-domain", "new_path": "libs/domain/fixed-assets/domain", "new_id": "domain-fixed-assets-domain"},
  {"old_path": "libs/domains/fixed-assets/presentation", "old_id": "api-fixed-assets-presentation", "new_path": "libs/domain/fixed-assets/presentation", "new_id": "domain-fixed-assets-presentation"},
  {"old_path": "libs/domains/finops", "old_id": "finops", "new_path": "libs/domain/finops/domain", "new_id": "domain-finops-domain"},
  {"old_path": "libs/domains/projects/contracts", "old_id": "contracts-projects-contracts", "new_path": "libs/domain/projects/contracts", "new_id": "domain-projects-contracts"},
  {"old_path": "libs/domains/projects/infrastructure", "old_id": "infra-projects-infrastructure", "new_path": "libs/domain/projects/infrastructure", "new_id": "domain-projects-infrastructure"},
  {"old_path": "libs/domains/projects/application", "old_id": "application-projects-application", "new_path": "libs/domain/projects/application", "new_id": "domain-projects-application"},
  {"old_path": "libs/domains/projects/domain", "old_id": "domain-projects-domain", "new_path": "libs/domain/projects/domain", "new_id": "domain-projects-domain"},
  {"old_path": "libs/domains/projects/presentation", "old_id": "api-projects-presentation", "new_path": "libs/domain/projects/presentation", "new_id": "domain-projects-presentation"},
  {"old_path": "libs/domains/treasury/contracts", "old_id": "contracts-treasury-contracts", "new_path": "libs/domain/treasury/contracts", "new_id": "domain-treasury-contracts"},
  {"old_path": "libs/domains/treasury/infrastructure", "old_id": "infra-treasury-infrastructure", "new_path": "libs/domain/treasury/infrastructure", "new_id": "domain-treasury-infrastructure"},
  {"old_path": "libs/domains/treasury/application", "old_id": "application-treasury-application", "new_path": "libs/domain/treasury/application", "new_id": "domain-treasury-application"},
  {"old_path": "libs/domains/treasury/domain", "old_id": "domain-treasury-domain", "new_path": "libs/domain/treasury/domain", "new_id": "domain-treasury-domain"},
  {"old_path": "libs/domains/treasury/presentation", "old_id": "api-treasury-presentation", "new_path": "libs/domain/treasury/presentation", "new_id": "domain-treasury-presentation"},
  {"old_path": "libs/domains/catalog/ui-store", "old_id": "catalog-ui-store", "new_path": "libs/domain/catalog/ui-store", "new_id": "domain-catalog-ui-store"},
  {"old_path": "libs/domains/catalog/infrastructure", "old_id": "infra-catalog-infrastructure", "new_path": "libs/domain/catalog/infrastructure", "new_id": "domain-catalog-infrastructure"},
  {"old_path": "libs/domains/catalog/application", "old_id": "application-catalog-application", "new_path": "libs/domain/catalog/application", "new_id": "domain-catalog-application"},
  {"old_path": "libs/domains/catalog/domain", "old_id": "domain-catalog-domain", "new_path": "libs/domain/catalog/domain", "new_id": "domain-catalog-domain"},
  {"old_path": "libs/domains/catalog/presentation", "old_id": "api-catalog-presentation", "new_path": "libs/domain/catalog/presentation", "new_id": "domain-catalog-presentation"},
  {"old_path": "libs/domains/fiscal/contracts", "old_id": "contracts-fiscal-contracts", "new_path": "libs/domain/fiscal/contracts", "new_id": "domain-fiscal-contracts"},
  {"old_path": "libs/domains/fiscal/infrastructure", "old_id": "infra-fiscal-infrastructure", "new_path": "libs/domain/fiscal/infrastructure", "new_id": "domain-fiscal-infrastructure"},
  {"old_path": "libs/domains/fiscal/application", "old_id": "application-fiscal-application", "new_path": "libs/domain/fiscal/application", "new_id": "domain-fiscal-application"},
  {"old_path": "libs/domains/fiscal/domain", "old_id": "domain-fiscal-domain", "new_path": "libs/domain/fiscal/domain", "new_id": "domain-fiscal-domain"},
  {"old_path": "libs/domains/fiscal/ui", "old_id": "fiscal-ui", "new_path": "libs/domain/fiscal/ui", "new_id": "domain-fiscal-ui"},
  {"old_path": "libs/domains/fiscal/presentation", "old_id": "api-fiscal-presentation", "new_path": "libs/domain/fiscal/presentation", "new_id": "domain-fiscal-presentation"},
  {"old_path": "libs/domains/accounting/contracts", "old_id": "contracts-accounting-contracts", "new_path": "libs/domain/accounting/contracts", "new_id": "domain-accounting-contracts"},
  {"old_path": "libs/domains/accounting/infrastructure", "old_id": "infra-accounting-infrastructure", "new_path": "libs/domain/accounting/infrastructure", "new_id": "domain-accounting-infrastructure"},
  {"old_path": "libs/domains/accounting/application", "old_id": "application-accounting-application", "new_path": "libs/domain/accounting/application", "new_id": "domain-accounting-application"},
  {"old_path": "libs/domains/accounting/domain", "old_id": "domain-accounting-domain", "new_path": "libs/domain/accounting/domain", "new_id": "domain-accounting-domain"},
  {"old_path": "libs/domains/accounting/presentation", "old_id": "api-accounting-presentation", "new_path": "libs/domain/accounting/presentation", "new_id": "domain-accounting-presentation"},
  {"old_path": "libs/shared/util/client/config", "old_id": "shared-util-config", "new_path": "libs/shared/util/client/config", "new_id": "shared-util-client-config"},
  {"old_path": "libs/shared/util/client/auth", "old_id": "shared-util-auth", "new_path": "libs/shared/util/client/auth", "new_id": "shared-util-client-auth"},
  {"old_path": "libs/shared/util/client/http", "old_id": "shared-util-http", "new_path": "libs/shared/util/client/http", "new_id": "shared-util-client-http"},
  {"old_path": "libs/shared/util/server/server-config", "old_id": "shared-util-server-config", "new_path": "libs/shared/util/server/server-config", "new_id": "shared-util-server-server-config"},
  {"old_path": "libs/shared/infrastructure/kafka", "old_id": "shared-infrastructure-kafka", "new_path": "libs/platform/kafka", "new_id": "platform-kafka"},
  {"old_path": "libs/shared/infrastructure/cache", "old_id": "shared-infrastructure-cache", "new_path": "libs/platform/cache", "new_id": "platform-cache"},
  {"old_path": "libs/shared/infrastructure/xslt", "old_id": "shared-infrastructure-xslt", "new_path": "libs/platform/xslt", "new_id": "platform-xslt"},
  {"old_path": "libs/shared/infrastructure/storage", "old_id": "shared-infrastructure-storage", "new_path": "libs/platform/storage", "new_id": "platform-storage"},
  {"old_path": "apps/frontend/virteex-mobile", "old_id": "virteex-mobile", "new_path": "apps/mobile/app", "new_id": "mobile-app"},
  {"old_path": "apps/frontend/virteex-ops-e2e", "old_id": "ops-console-web-e2e", "new_path": "apps/web/ops/e2e", "new_id": "web-ops-e2e"},
  {"old_path": "apps/frontend/virteex-shopfloor", "old_id": "virteex-shopfloor", "new_path": "apps/web/shopfloor/app", "new_id": "web-shopfloor-app"},
  {"old_path": "apps/frontend/virteex-ops", "old_id": "ops-console-web", "new_path": "apps/web/ops/app", "new_id": "web-ops-app"},
  {"old_path": "apps/frontend/virteex-cms", "old_id": "virteex-cms", "new_path": "apps/web/cms/app", "new_id": "web-cms-app"},
  {"old_path": "apps/frontend/virteex-site", "old_id": "virteex-site", "new_path": "apps/web/site/app", "new_id": "web-site-app"},
  {"old_path": "apps/frontend/virteex-mobile-e2e", "old_id": "virteex-mobile-e2e", "new_path": "apps/mobile/e2e", "new_id": "mobile-e2e"},
  {"old_path": "apps/frontend/virteex-cms-e2e", "old_id": "virteex-cms-e2e", "new_path": "apps/web/cms/e2e", "new_id": "web-cms-e2e"},
  {"old_path": "apps/frontend/virteex-web", "old_id": "virteex-web", "new_path": "apps/web/portal/app", "new_id": "web-portal-app"},
  {"old_path": "apps/frontend/virteex-wms", "old_id": "virteex-wms", "new_path": "apps/web/wms/app", "new_id": "web-wms-app"},
  {"old_path": "apps/frontend/virteex-support-e2e", "old_id": "virteex-support-e2e", "new_path": "apps/web/support/e2e", "new_id": "web-support-e2e"},
  {"old_path": "apps/frontend/virteex-web-e2e", "old_id": "virteex-web-e2e", "new_path": "apps/web/portal/e2e", "new_id": "web-portal-e2e"},
  {"old_path": "apps/frontend/virteex-store", "old_id": "virteex-store", "new_path": "apps/web/store/app", "new_id": "web-store-app"},
  {"old_path": "apps/frontend/virteex-desktop", "old_id": "virteex-desktop", "new_path": "apps/desktop/app", "new_id": "desktop-app"},
  {"old_path": "apps/frontend/virteex-support", "old_id": "virteex-support", "new_path": "apps/web/support/app", "new_id": "web-support-app"},
  {"old_path": "apps/frontend/virteex-site-e2e", "old_id": "virteex-site-e2e", "new_path": "apps/web/site/e2e", "new_id": "web-site-e2e"},
  {"old_path": "apps/gateways/virteex-api-gateway", "old_id": "virteex-api-gateway", "new_path": "apps/api/gateway/app", "new_id": "api-gateway-app"},
  {"old_path": "apps/gateways/virteex-gateway", "old_id": "virteex-gateway", "new_path": "apps/api/gateway-legacy/app", "new_id": "api-gateway-legacy-app"},
  {"old_path": "apps/gateways/virteex-gateway-e2e", "old_id": "virteex-gateway-e2e", "new_path": "apps/api/gateway-legacy/e2e", "new_id": "api-gateway-legacy-e2e"},
  {"old_path": "apps/gateways/virteex-api-gateway-e2e", "old_id": "virteex-api-gateway-e2e", "new_path": "apps/api/gateway/e2e", "new_id": "api-gateway-e2e"},
  {"old_path": "apps/workers/virteex-scheduler-service", "old_id": "virteex-scheduler-service", "new_path": "apps/worker/scheduler/app", "new_id": "worker-scheduler-app"},
  {"old_path": "apps/workers/virteex-scheduler-service-e2e", "old_id": "virteex-scheduler-service-e2e", "new_path": "apps/worker/scheduler/e2e", "new_id": "worker-scheduler-e2e"},
  {"old_path": "apps/workers/virteex-notification-service", "old_id": "virteex-notification-service", "new_path": "apps/worker/notification/app", "new_id": "worker-notification-app"},
  {"old_path": "apps/workers/virteex-notification-service-e2e", "old_id": "virteex-notification-service-e2e", "new_path": "apps/worker/notification/e2e", "new_id": "worker-notification-e2e"},
  {"old_path": "apps/backend/virteex-billing-service", "old_id": "virteex-billing-service", "new_path": "apps/api/billing/app", "new_id": "api-billing-app"},
  {"old_path": "apps/backend/virteex-treasury-service-e2e", "old_id": "virteex-treasury-service-e2e", "new_path": "apps/api/treasury/e2e", "new_id": "api-treasury-e2e"},
  {"old_path": "apps/backend/virteex-projects-service", "old_id": "virteex-projects-service", "new_path": "apps/api/projects/app", "new_id": "api-projects-app"},
  {"old_path": "apps/backend/virteex-plugin-host", "old_id": "virteex-plugin-host", "new_path": "apps/api/plugin-host/app", "new_id": "api-plugin-host-app"},
  {"old_path": "apps/backend/virteex-bi-service", "old_id": "virteex-bi-service", "new_path": "apps/api/bi/app", "new_id": "api-bi-app"},
  {"old_path": "apps/backend/virteex-manufacturing-service-e2e", "old_id": "virteex-manufacturing-service-e2e", "new_path": "apps/api/manufacturing/e2e", "new_id": "api-manufacturing-e2e"},
  {"old_path": "apps/backend/virteex-accounting-service-e2e", "old_id": "virteex-accounting-service-e2e", "new_path": "apps/api/accounting/e2e", "new_id": "api-accounting-e2e"},
  {"old_path": "apps/backend/virteex-catalog-service", "old_id": "virteex-catalog-service", "new_path": "apps/api/catalog/app", "new_id": "api-catalog-app"},
  {"old_path": "apps/backend/virteex-accounting-service", "old_id": "virteex-accounting-service", "new_path": "apps/api/accounting/app", "new_id": "api-accounting-app"},
  {"old_path": "apps/backend/virteex-subscription-service", "old_id": "virteex-subscription-service", "new_path": "apps/api/subscription/app", "new_id": "api-subscription-app"},
  {"old_path": "apps/backend/virteex-fiscal-service-e2e", "old_id": "virteex-fiscal-service-e2e", "new_path": "apps/api/fiscal/e2e", "new_id": "api-fiscal-e2e"},
  {"old_path": "apps/backend/virteex-billing-service-e2e", "old_id": "virteex-billing-service-e2e", "new_path": "apps/api/billing/e2e", "new_id": "api-billing-e2e"},
  {"old_path": "apps/backend/virteex-fixed-assets-service-e2e", "old_id": "virteex-fixed-assets-service-e2e", "new_path": "apps/api/fixed-assets/e2e", "new_id": "api-fixed-assets-e2e"},
  {"old_path": "apps/backend/virteex-catalog-service-e2e", "old_id": "virteex-catalog-service-e2e", "new_path": "apps/api/catalog/e2e", "new_id": "api-catalog-e2e"},
  {"old_path": "apps/backend/virteex-payroll-service-e2e", "old_id": "virteex-payroll-service-e2e", "new_path": "apps/api/payroll/e2e", "new_id": "api-payroll-e2e"},
  {"old_path": "apps/backend/virteex-identity-service", "old_id": "virteex-identity-service", "new_path": "apps/api/identity/app", "new_id": "api-identity-app"},
  {"old_path": "apps/backend/virteex-admin-service-e2e", "old_id": "virteex-admin-service-e2e", "new_path": "apps/api/admin/e2e", "new_id": "api-admin-e2e"},
  {"old_path": "apps/backend/virteex-identity-service-e2e", "old_id": "virteex-identity-service-e2e", "new_path": "apps/api/identity/e2e", "new_id": "api-identity-e2e"},
  {"old_path": "apps/backend/virteex-fixed-assets-service", "old_id": "virteex-fixed-assets-service", "new_path": "apps/api/fixed-assets/app", "new_id": "api-fixed-assets-app"},
  {"old_path": "apps/backend/virteex-projects-service-e2e", "old_id": "virteex-projects-service-e2e", "new_path": "apps/api/projects/e2e", "new_id": "api-projects-e2e"},
  {"old_path": "apps/backend/virteex-manufacturing-service", "old_id": "virteex-manufacturing-service", "new_path": "apps/api/manufacturing/app", "new_id": "api-manufacturing-app"},
  {"old_path": "apps/backend/virteex-inventory-service", "old_id": "virteex-inventory-service", "new_path": "apps/api/inventory/app", "new_id": "api-inventory-app"},
  {"old_path": "apps/backend/virteex-bi-service-e2e", "old_id": "virteex-bi-service-e2e", "new_path": "apps/api/bi/e2e", "new_id": "api-bi-e2e"},
  {"old_path": "apps/backend/virteex-crm-service", "old_id": "virteex-crm-service", "new_path": "apps/api/crm/app", "new_id": "api-crm-app"},
  {"old_path": "apps/backend/virteex-admin-service", "old_id": "virteex-admin-service", "new_path": "apps/api/admin/app", "new_id": "api-admin-app"},
  {"old_path": "apps/backend/virteex-treasury-service", "old_id": "virteex-treasury-service", "new_path": "apps/api/treasury/app", "new_id": "api-treasury-app"},
  {"old_path": "apps/backend/virteex-purchasing-service-e2e", "old_id": "virteex-purchasing-service-e2e", "new_path": "apps/api/purchasing/e2e", "new_id": "api-purchasing-e2e"},
  {"old_path": "apps/backend/virteex-purchasing-service", "old_id": "virteex-purchasing-service", "new_path": "apps/api/purchasing/app", "new_id": "api-purchasing-app"},
  {"old_path": "apps/backend/virteex-fiscal-service", "old_id": "virteex-fiscal-service", "new_path": "apps/api/fiscal/app", "new_id": "api-fiscal-app"},
  {"old_path": "apps/backend/virteex-payroll-service", "old_id": "virteex-payroll-service", "new_path": "apps/api/payroll/app", "new_id": "api-payroll-app"}
]

# 1. MOVES
for item in mapping:
    old = item['old_path']
    new = item['new_path']
    if os.path.exists(old) and old != new:
        os.makedirs(os.path.dirname(new), exist_ok=True)
        subprocess.run(['mv', old, new])

# 2. CLEANUP OLD
for d in ['apps/backend', 'apps/frontend', 'apps/gateways', 'apps/workers', 'libs/domains']:
    if os.path.exists(d):
        subprocess.run(['rm', '-rf', d])

# 3. GLOBAL CONFIG FIX
old_to_new_id = {item['old_id']: item['new_id'] for item in mapping}
old_to_new_path = {item['old_path']: item['new_path'] for item in mapping}
sorted_old_paths = sorted(old_to_new_path.keys(), key=len, reverse=True)
sorted_old_ids = sorted(old_to_new_id.keys(), key=len, reverse=True)

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root: continue
    for f in files:
        if f.endswith('.json') or f.endswith('.mjs'):
            p = os.path.join(root, f)
            try:
                with open(p, 'r') as file: content = file.read()
                updated = False
                for op in sorted_old_paths:
                    if op in content:
                        content = content.replace(op, old_to_new_path[op])
                        updated = True
                for oi in sorted_old_ids:
                    if oi in content:
                        content = content.replace(oi, old_to_new_id[oi])
                        updated = True

                # Fix relative tsconfig extends
                if f.endswith('.json') and 'tsconfig.base.json' in content:
                    norm_root = os.path.normpath(root)
                    depth = 0 if norm_root == '.' else len(norm_root.split(os.sep))
                    new_rel = ("../" * depth) + "tsconfig.base.json"
                    content = re.sub(r'(\.\./)+tsconfig\.base\.json', new_rel, content)
                    updated = True

                # Fix relative eslint imports
                if f == 'eslint.config.mjs' and root != '.':
                    norm_root = os.path.normpath(root)
                    depth = len(norm_root.split(os.sep))
                    new_rel = ("../" * depth) + "eslint.config.mjs"
                    content = re.sub(r'from\s+["\'](\.\./)+eslint\.config\.mjs["\']', f'from "{new_rel}"', content)
                    updated = True

                if updated:
                    with open(p, 'w') as file: file.write(content)
            except: pass

# 4. Explicit name check in project.json
for root, dirs, files in os.walk('.'):
    if 'project.json' in files:
        p = os.path.join(root, 'project.json')
        try:
            with open(p, 'r') as f: config = json.load(f)
            # Find which project this is based on its path
            rel_path = os.path.normpath(root).lstrip('./')
            for item in mapping:
                if item['new_path'] == rel_path:
                    if config['name'] != item['new_id']:
                        config['name'] = item['new_id']
                        with open(p, 'w') as f: json.dump(config, f, indent=2)
                    break
        except: pass
