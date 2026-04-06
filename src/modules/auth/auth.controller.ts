import { ControllerBase } from "@/core/base/controller.base";
import { TContext, TEnv } from "@/core/types/common";
import { RouteHandler } from "@hono/zod-openapi";
import { AuthService } from "./auth.service";
import { UserRepository } from "@/modules/user/user.repository";
import { AuthRoutes } from "./auth.routes";
import { LoginDto, RegisterDto } from "./dtos/auth.dto";
import { z } from "@hono/zod-openapi";

export class AuthController extends ControllerBase<AuthRoutes, UserRepository, AuthService> {
    initialize(c: TContext): void {
        this.repository = new UserRepository(c);
        this.service = new AuthService(c, this.repository);
    }

    public login: RouteHandler<typeof this.routes.loginConfig, TEnv> = async (c) => {
        this.initialize(c);
        const body = (await c.req.json()) as z.infer<typeof LoginDto>;

        const result = await this.service!.login(body, c.env);
        return this.sendResponse(c, result);
    };

    public register: RouteHandler<typeof this.routes.registerConfig, TEnv> = async (c) => {
        this.initialize(c);
        const body = (await c.req.json()) as z.infer<typeof RegisterDto>;

        const result = await this.service!.register(body, c.env);
        return this.sendResponse(c, result);
    };
}
