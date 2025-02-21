import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['src/export.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
});
