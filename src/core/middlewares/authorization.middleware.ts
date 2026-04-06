import { USER_ROLE, userTable } from "@/modules/user/schemas/user.schema";
import { eq } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { ForbiddenException } from "../exception/base.exception";
import { TEnv } from "../types/common";

// Get identity from JWT token if available, not verify access
export const useIdentity = createMiddleware<TEnv>(async (c, next) => {
    // Anonymous access
    const authorizationHeader = c.req.header("Authorization");
    if (!authorizationHeader) {
        return next();
    }

    // Authorized access
    try {
        // https://hono.dev/docs/middleware/builtin/jwt
        const jwtMiddleware = jwt({
            secret: c.env.JWT_SECRET,
            alg: "HS256",
        });
        await jwtMiddleware(c, async () => Promise.resolve());

        const decoded = c.get("jwtPayload");

        const db = c.get("db");
        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, decoded.id!))
            .limit(1)
            .then((res) => res[0]);

        if (!user) {
            throw new Error("User not found");
        }

        c.set("user", user);
        return next();
    } catch (error: any) {
        console.error(error);
        deleteCookie(c, "auth_token");
        return next();
    }
});

// Authenticate before access
export const createAuthMiddleware = (...roles: USER_ROLE[]) => {
    return createMiddleware<TEnv>(async (c, next) => {
        const user = c.get("user");
        if (!user) {
            throw new ForbiddenException("Authentication required");
        }

        if (!roles.includes(user.role)) {
            throw new ForbiddenException("Insufficient permissions");
        }

        return next();
    });
};
