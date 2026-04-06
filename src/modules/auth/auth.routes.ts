import { createRoute } from "@hono/zod-openapi";
import { LoginDto, RegisterDto, AuthResponseDto } from "./dtos/auth.dto";
import { RoutesBase } from "@/core/base/routes.base";

export class AuthRoutes extends RoutesBase {
    loginConfig = createRoute({
        method: "post",
        path: "/login",
        summary: "User login by identifier",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: LoginDto,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Login successful",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(AuthResponseDto),
                    },
                },
            },
        },
    });

    registerConfig = createRoute({
        method: "post",
        path: "/register",
        summary: "User registration",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: RegisterDto,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Registration successful",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(AuthResponseDto),
                    },
                },
            },
        },
    });
}
