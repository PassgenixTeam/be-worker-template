import { OpenAPIHono } from "@hono/zod-openapi";
import apiApp from "./api-app";
import { registerOpenAPI } from "./core/config/openapi.config";
import { TEnv } from "./core/types/common";

const app = new OpenAPIHono<TEnv>();

// OpenAPI + SwaggerUI
registerOpenAPI(app);

// Mount API app
app.route("/api", apiApp);

// Redirect root to docs
app.get("/", (c) => c.redirect("/docs"));

export default app;
