import { createRoute, z } from "@hono/zod-openapi";
import { GetUserDto, UpdateUserDto, UserDto } from "./dtos/user.dto";
import { RoutesBase } from "@/core/base/routes.base";

export class UserRoutes extends RoutesBase {
    // Anonymous routes
    listUsers = createRoute({
        method: "get",
        path: "/",
        summary: "List all users",
        request: {
            query: GetUserDto,
        },
        responses: {
            200: {
                description: "List of users",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(z.array(UserDto)),
                    },
                },
            },
        },
    });

    // Authorized routes
    getProfile = createRoute({
        method: "get",
        path: "/profile",
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "User profile",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(UserDto),
                    },
                },
            },
        },
    });

    updateProfile = createRoute({
        method: "patch",
        path: "/profile",
        summary: "Update current user profile",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdateUserDto,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Updated user profile",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(UserDto),
                    },
                },
            },
        },
    });
}
