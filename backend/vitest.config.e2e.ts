import {
  defineConfig,
} from 'vitest/config';

export default defineConfig({
  test: {
    environment:
      'node',

    include: [
      'test/e2e/**/*.e2e-spec.ts',
    ],

    fileParallelism:
      false,

    maxWorkers:
      1,

    testTimeout:
      60000,

    hookTimeout:
      60000,

    reporters: [
      'verbose',
    ],
  },
});
