import { Hook } from "@hono/zod-openapi";
import { TEnv } from "@/core/types/common";

// Zod OpenAPI Middleware for Hono framework already process the parameter validation step in their middleware.
// However, we want to customize the error response format to match our API standards.
// This middleware will catch the validation errors and format them accordingly.
// Reference: https://github.com/honojs/middleware/tree/main/packages/zod-openapi
export const validationMiddleware: Hook<any, TEnv, any, any> = (result, c) => {
    if (!result.success) {
        const formattedErrors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return c.json(
            {
                statusCode: 422,
                message: "Validation Failed",
                data: formattedErrors,
            },
            422
        );
    }
};
