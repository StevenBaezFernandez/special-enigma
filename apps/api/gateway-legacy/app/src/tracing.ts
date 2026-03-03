import { createOtelSdk } from '@virteex/shared-util-server-server-config';

// Initialize OpenTelemetry SDK for Gateway
export const otelSDK = createOtelSdk('virteex-api-gateway');
