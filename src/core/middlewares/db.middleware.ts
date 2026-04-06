import { TEnv } from "@core/types/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { createMiddleware } from "hono/factory";

export const useDB = createMiddleware<TEnv>(async (c, next) => {
    const db = drizzle({
        connection: {
            connectionString: c.env.HYPERDRIVE.connectionString,
            ssl: true,
        },
    });

    c.set("db", db);

    return next();
});
