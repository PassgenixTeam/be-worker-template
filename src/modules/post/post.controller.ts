import { ControllerBase } from "@/core/base/controller.base";
import { ForbiddenException } from "@/core/exception/base.exception";
import { TContext, TEnv } from "@/core/types/common";
import { RouteHandler, z } from "@hono/zod-openapi";
import { PostRoutes } from "./post.routes";
import { PostRepository } from "./post.repository";
import { PostService } from "./post.service";
import { CreatePostDto, GetPostDto, PostIdParamDto, UpdatePostDto } from "./dtos/post.dto";

export class PostController extends ControllerBase<PostRoutes, PostRepository, PostService> {
    initialize(c: TContext): void {
        this.repository = new PostRepository(c);
        this.service = new PostService(c, this.repository);
    }

    public list: RouteHandler<typeof this.routes.getAll, TEnv> = async (c) => {
        this.initialize(c);
        const query = c.req.valid("query") as z.infer<typeof GetPostDto>;
        const rows = await this.service!.getAll(query);
        return this.sendResponse(c, rows);
    };

    public getById: RouteHandler<typeof this.routes.getById, TEnv> = async (c) => {
        this.initialize(c);
        const { id } = c.req.valid("param") as z.infer<typeof PostIdParamDto>;
        const row = await this.service!.getById(id);
        return this.sendResponse(c, row);
    };

    public create: RouteHandler<typeof this.routes.create, TEnv> = async (c) => {
        this.initialize(c);
        if (!c.get("user")) throw new ForbiddenException("Authentication required");
        const body = (await c.req.json()) as z.infer<typeof CreatePostDto>;
        const userId = c.get("user")!.id;
        const row = await this.service!.create(body, userId);
        return this.sendResponse(c, row);
    };

    public update: RouteHandler<typeof this.routes.update, TEnv> = async (c) => {
        this.initialize(c);
        if (!c.get("user")) throw new ForbiddenException("Authentication required");
        const { id } = c.req.valid("param") as z.infer<typeof PostIdParamDto>;
        const body = (await c.req.json()) as z.infer<typeof UpdatePostDto>;
        const userId = c.get("user")!.id;
        const row = await this.service!.update(id, body, userId);
        return this.sendResponse(c, row);
    };

    public delete: RouteHandler<typeof this.routes.delete, TEnv> = async (c) => {
        this.initialize(c);
        if (!c.get("user")) throw new ForbiddenException("Authentication required");
        const { id } = c.req.valid("param") as z.infer<typeof PostIdParamDto>;
        const userId = c.get("user")!.id;
        const row = await this.service!.delete(id, userId);
        return this.sendResponse(c, row);
    };
}
