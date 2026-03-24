import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '../../../../node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../../node_modules/.vitest/libs/domain/identity/ui',
  plugins: [
    angular({
      jit: true,
      tsconfig: './tsconfig.spec.json',
    }),
    nxViteTsPaths()
  ],
  test: {
    globals: true,
    cache: {
      dir: '../../../../node_modules/.vitest',
    },
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    alias: {
      '@virteex/shared-ui': '/app/libs/shared/ui/src/index.ts',
      '@virteex/shared-config': '/app/libs/shared/config/src/index.ts',
      '@virteex/identity-ui': '/app/libs/domain/identity/ui/src/index.ts',
      '@virteex/domain-identity-contracts': '/app/libs/domain/identity/contracts/src/index.ts',
      '@virteex/shared-util-auth': '/app/libs/shared/util/client/auth/src/index.ts',
      '@ngx-translate/core': '/app/node_modules/@ngx-translate/core/fesm2022/ngx-translate-core.mjs'
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../../coverage/libs/domain/identity/ui',
      provider: 'v8',
    },
  },
});
