/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/virteex-web',
  resolve: {
    alias: {
      'class-transformer/storage': 'class-transformer',
    },
  },
  optimizeDeps: {
    exclude: [
      'dustjs-linkedin',
      'atpl',
      'jazz',
      'hamljs',
      'hamlet',
      'haml-coffee',
      'hogan.js',
      'templayed',
      'walrus',
      'plates',
      'teacup/lib/express',
      'twing',
    ],
  },
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  test: {
    name: 'virteex-web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/virteex-web',
      provider: 'v8' as const,
    },
  },
}));
