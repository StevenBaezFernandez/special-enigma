import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts'],
    alias: {
      '@virteex/domain-fiscal-domain': path.resolve(__dirname, './libs/domain/fiscal/domain/src/index.ts'),
      '@virteex/domain-fiscal-infrastructure': path.resolve(__dirname, './libs/domain/fiscal/infrastructure/src/index.ts'),
      '@virteex/domain-payroll-domain': path.resolve(__dirname, './libs/domain/payroll/domain/src/index.ts'),
      '@virteex/kernel-auth': path.resolve(__dirname, './libs/kernel/auth/src/index.ts'),
      '@virteex/kernel-tenant': path.resolve(__dirname, './libs/kernel/tenant/src/index.ts'),
      '@virteex/kernel-telemetry': path.resolve(__dirname, './libs/kernel/telemetry/src/index.ts'),
      '@virteex/platform-kafka': path.resolve(__dirname, './libs/platform/kafka/src/index.ts'),
    }
  },
});
