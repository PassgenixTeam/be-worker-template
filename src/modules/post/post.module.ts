import { ModuleBase } from "@/core/base/module.base";
import { PostRoutes } from "./post.routes";
import { PostController } from "./post.controller";
import { USER_ROLE } from "../user/schemas/user.schema";
import { createAuthMiddleware } from "@/core/middlewares/authorization.middleware";

export class PostModule extends ModuleBase {}

const postModule = new PostModule("/posts", "Post");

const routes = new PostRoutes();
const controller = new PostController(routes);

postModule.addController(routes.getAll, controller.list);
postModule.addController(routes.getById, controller.getById);
postModule.addController(routes.create, controller.create, createAuthMiddleware(USER_ROLE.USER));
postModule.addController(routes.update, controller.update, createAuthMiddleware(USER_ROLE.USER));
postModule.addController(routes.delete, controller.delete, createAuthMiddleware(USER_ROLE.USER));

export default postModule;
