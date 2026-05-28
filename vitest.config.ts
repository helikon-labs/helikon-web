import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            globals: true,
            passWithNoTests: false,
            setupFiles: ['./src/test/test-setup.ts'],
            coverage: {
                provider: 'v8',
                include: ['src/**/*.{ts,tsx}'],
                exclude: ['src/index.tsx', 'src/event/**', 'src/vite-env.d.ts'],
                reporter: ['text', 'html', 'lcov'],
                thresholds: {
                    statements: 80,
                    branches: 70,
                    functions: 80,
                    lines: 80,
                },
            },
        },
    }),
);
