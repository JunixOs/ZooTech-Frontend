import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/app/core'),
      '@shared': resolve(__dirname, 'src/app/shared'),
      '@modules': resolve(__dirname, 'src/app/modules'),
      '@env': resolve(__dirname, 'src/environments'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'text'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      include: ['src/app/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/test-setup.ts', 'src/environments/**'],
    },
  },
});
