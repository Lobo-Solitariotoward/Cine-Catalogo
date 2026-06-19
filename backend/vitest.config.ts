import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            thresholds: {
                lines: 75,
                functions: 75,
                branches: 75,
                statements: 75,
            },
        },
    },
})
