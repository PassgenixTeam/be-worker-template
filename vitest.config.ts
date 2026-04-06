import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [
        cloudflareTest({
            wrangler: { configPath: "./wrangler.jsonc" },
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@core": resolve(__dirname, "src/core"),
            "@db": resolve(__dirname, "src/db"),
            "@utils": resolve(__dirname, "src/utils"),
            "@modules": resolve(__dirname, "src/modules"),
        },
    },
    test: {
        include: ["tests/**/*.test.ts"],
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
        },
    },
});
