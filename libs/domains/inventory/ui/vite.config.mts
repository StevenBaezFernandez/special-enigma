/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  plugins: [
    angular({
      tsconfig: path.resolve(__dirname, 'tsconfig.spec.json')
    }),
    nxViteTsPaths()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    server: {
      deps: {
        inline: ['@angular/compiler']
      }
    }
  },
}));
