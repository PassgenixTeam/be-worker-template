import { ModuleBase } from "@/core/base/module.base";
import { UserController } from "./user.controller";
import { UserRoutes } from "./user.routes";
import { createAuthMiddleware } from "@/core/middlewares/authorization.middleware";
import { USER_ROLE } from "./schemas/user.schema";

export class UserModule extends ModuleBase {}

const userModule = new UserModule("/users", "User");

const routes = new UserRoutes();
const controller = new UserController(routes);

userModule.addController(routes.listUsers, controller.listUsers);
userModule.addController(routes.getProfile, controller.getProfile, createAuthMiddleware(USER_ROLE.USER));
userModule.addController(routes.updateProfile, controller.updateProfile, createAuthMiddleware(USER_ROLE.USER));

export default userModule;
