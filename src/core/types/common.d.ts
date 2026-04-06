import { userTable } from "@/modules/user/schemas/user.schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Context } from "hono";
import { JwtVariables } from "hono/jwt";

export type TEnvironmentVariable = {
    JWT_SECRET: string;
    HYPERDRIVE: Hyperdrive;
    RESEND_API_KEY?: string;
    ADMIN_EMAIL?: string;
    OPENAI_API_KEY: string;
    ZALO_BOT_TOKEN: string;
    ZALO_BOT_SECRET_TOKEN: string;
    HOST_URL: string;
    PLAYWRIGHT_MCP_HOST: string;
};

export type TEnv = {
    Bindings: CloudflareBindings & TEnvironmentVariable;
    Variables: JwtVariables & {
        user: typeof userTable.$inferSelect | undefined;
        db: ReturnType<typeof drizzle>;
    };
};

export type TContext = Context<TEnv>;
