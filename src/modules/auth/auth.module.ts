import { ModuleBase } from "@/core/base/module.base";
import { AuthController } from "./auth.controller";
import { AuthRoutes } from "./auth.routes";

export class AuthModule extends ModuleBase {}

const authModule = new AuthModule("/auth", "Auth");

const routes = new AuthRoutes();
const controller = new AuthController(routes);

authModule.addController(routes.loginConfig, controller.login);
authModule.addController(routes.registerConfig, controller.register);

export default authModule;
