import { OpenAPIHono } from "@hono/zod-openapi"; // Note: validationExceptionMiddleware should be imported first or separately.
import { cors } from "hono/cors";

import { useIdentity } from "./core/middlewares/authorization.middleware";
import { useDB } from "./core/middlewares/db.middleware";
import { globalExceptionMiddleware } from "./core/middlewares/global-exception.middleware";
import { queryExceptionMiddleware } from "./core/middlewares/query-exception.middleware";
import { validationMiddleware } from "./core/middlewares/validation-exception.middleware";
import { TEnv } from "./core/types/common";

import authModule from "./modules/auth/auth.module";
import userModule from "./modules/user/user.module";
import postModule from "./modules/post/post.module";

const apiApp = new OpenAPIHono<TEnv>({
    defaultHook: validationMiddleware, // Add Zod hook
});

// Enable CORS
apiApp.use("/*", cors());

// Database Middleware
apiApp.use(useDB);

// Identity Middleware
apiApp.use(useIdentity);

// Error Handling Middleware (query errors first, then global catch-all)
apiApp.onError(async (err, c) => {
    try {
        return await queryExceptionMiddleware(err, c);
    } catch (e) {
        return globalExceptionMiddleware(e as Error, c);
    }
});

// Integrate Modules
authModule.integrate(apiApp);
userModule.integrate(apiApp);
postModule.integrate(apiApp);

export default apiApp;
