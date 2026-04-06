import { defineConfig } from "drizzle-kit";

const dbConfig = defineConfig({
    out: "./src/db/migrations",
    schema: ["./src/**/*.schema.ts"],
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DB_CONNECTION_STRING!,
    },
});

export default dbConfig;
