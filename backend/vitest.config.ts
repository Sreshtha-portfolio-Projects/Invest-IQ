import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 120_000,
    /**
     * Injected into test workers (overrides `backend/.env` which may set `VITEST_GEMINI_REAL=1`).
     * Use stubbed Gemini by default; live API: `cross-env VITEST_GEMINI_REAL=1 npm test`.
     */
    env: { VITEST: 'true', VITEST_GEMINI_REAL: '0' },
  },
});
