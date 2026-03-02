import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../../node_modules/.vite/libs/domain/fiscal/infrastructure',

  plugins: [nxViteTsPaths()],

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../../coverage/libs/domain/fiscal/infrastructure',
      provider: 'v8',
    },
  },
});
