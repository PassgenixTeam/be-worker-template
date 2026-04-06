import fs from "fs";
import { parse } from "jsonc-parser";
import { defineConfig } from "drizzle-kit";
import assert from "assert";

const wranglerConfigRaw = fs.readFileSync("wrangler.jsonc", "utf-8");
const wranglerConfig = parse(wranglerConfigRaw);

const hyperdriveConfig = wranglerConfig.hyperdrive?.find((h: any) => h.binding === "HYPERDRIVE");

assert(hyperdriveConfig, "HYPERDRIVE binding not found in wrangler.jsonc hyperdrive configuration");
assert(hyperdriveConfig.localConnectionString, "localConnectionString not found for HYPERDRIVE binding");

console.log(`Connection String: ${hyperdriveConfig.localConnectionString}`);

const dbConfig = defineConfig({
    out: "./src/db/migrations",
    schema: ["./src/**/*.schema.ts"],
    dialect: "postgresql",
    dbCredentials: {
        url: hyperdriveConfig.localConnectionString,
    },
});

export default dbConfig;
