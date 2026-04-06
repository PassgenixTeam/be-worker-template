import { ControllerBase } from "@/core/base/controller.base";
import { TContext, TEnv } from "@/core/types/common";
import { RouteHandler } from "@hono/zod-openapi";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { UserRoutes } from "./user.routes";
import { UnauthorizedException } from "@/core/exception/base.exception";
import { ERROR_CODES } from "@/core/config/error-codes.config";
import { z } from "@hono/zod-openapi";
import { GetUserDto, UpdateUserDto } from "./dtos/user.dto";

export class UserController extends ControllerBase<UserRoutes, UserRepository, UserService> {
    initialize(c: TContext): void {
        this.repository = new UserRepository(c);
        this.service = new UserService(c, this.repository);
    }

    public listUsers: RouteHandler<typeof this.routes.listUsers, TEnv> = async (c) => {
        this.initialize(c);
        const query = c.req.valid("query") as z.infer<typeof GetUserDto>;
        const users = await this.service!.getAllUsers(query);
        return this.sendResponse(c, users);
    };

    public getProfile: RouteHandler<typeof this.routes.getProfile, TEnv> = async (c) => {
        this.initialize(c);
        const user = c.get("user");

        if (!user) {
            throw new UnauthorizedException(ERROR_CODES.UNAUTHORIZED);
        }

        const profile = await this.service!.getProfile(user.id);
        return this.sendResponse(c, profile);
    };

    public updateProfile: RouteHandler<typeof this.routes.updateProfile, TEnv> = async (c) => {
        this.initialize(c);
        const user = c.get("user");
        const body = (await c.req.json()) as z.infer<typeof UpdateUserDto>;

        if (!user) {
            throw new UnauthorizedException(ERROR_CODES.UNAUTHORIZED);
        }

        const updatedUser = await this.service!.updateUser(user.id, body);
        return this.sendResponse(c, updatedUser);
    };
}
