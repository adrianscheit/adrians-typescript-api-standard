import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/common.ts", 'src/service.ts', 'src/customer.ts', 'basic-validation.ts'],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
});
