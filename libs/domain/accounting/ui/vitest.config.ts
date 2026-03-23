import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    alias: {
      '@virteex/domain-accounting-contracts': path.resolve(__dirname, '../contracts/src/index.ts'),
    }
  },
});
