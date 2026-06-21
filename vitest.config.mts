import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: [
      'lib/contracts/**/*.test.ts',
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/property/**/*.test.ts',
    ],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/contracts/**/*.ts', 'app/**/*.ts', 'lib/**/*.ts'],
      exclude: [
        'lib/contracts/**/*.test.ts',
        'tests/**',
      ],
    },
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
