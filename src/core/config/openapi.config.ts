import { OpenAPIHono } from "@hono/zod-openapi";
import { TEnv } from "@core/types/common";
import { swaggerUI } from "@hono/swagger-ui";

export function registerOpenAPI(
    app: OpenAPIHono<TEnv>,
    options?: { title?: string; version?: string; description?: string }
) {
    // OpenAPI JSON
    app.doc("/openapi.json", {
        openapi: "3.1.0",
        info: {
            title: options?.title || "Platform API",
            version: options?.version || "1.0.0",
            description: options?.description || "API documentation for Platform Worker API",
        },
    });

    // Authorization methods
    app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
    });

    // Swagger UI
    app.get("/", swaggerUI({ url: "/openapi.json", title: "Platform API Docs" }));
}
