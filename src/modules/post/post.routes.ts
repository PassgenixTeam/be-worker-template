import { RoutesBase } from "@/core/base/routes.base";
import { createRoute, z } from "@hono/zod-openapi";
import { CreatePostDto, GetPostDto, PostDto, PostIdParamDto, UpdatePostDto } from "./dtos/post.dto";

export class PostRoutes extends RoutesBase {
    // Anonymous routes
    getAll = createRoute({
        method: "get",
        path: "/",
        summary: "List posts",
        request: { query: GetPostDto },
        responses: {
            200: {
                description: "List of posts",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(z.array(PostDto)),
                    },
                },
            },
        },
    });

    getById = createRoute({
        method: "get",
        path: "/{id}",
        summary: "Get post by id",
        request: { params: PostIdParamDto },
        responses: {
            200: {
                description: "Post detail",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(PostDto),
                    },
                },
            },
        },
    });

    // Authorized routes
    create = createRoute({
        method: "post",
        path: "/",
        summary: "Create a new post",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": { schema: CreatePostDto },
                },
            },
        },
        responses: {
            200: {
                description: "Created post",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(PostDto),
                    },
                },
            },
        },
    });

    update = createRoute({
        method: "patch",
        path: "/{id}",
        summary: "Update post status/slots",
        security: [{ bearerAuth: [] }],
        request: {
            params: PostIdParamDto,
            body: {
                content: {
                    "application/json": { schema: UpdatePostDto },
                },
            },
        },
        responses: {
            200: {
                description: "Updated post",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(PostDto),
                    },
                },
            },
        },
    });

    delete = createRoute({
        method: "delete",
        path: "/{id}",
        summary: "Delete a post (owner only)",
        security: [{ bearerAuth: [] }],
        request: { params: PostIdParamDto },
        responses: {
            200: {
                description: "Deleted post",
                content: {
                    "application/json": {
                        schema: this.createSuccessResponse(PostDto),
                    },
                },
            },
        },
    });
}
