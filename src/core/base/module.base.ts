import { createRoute, OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { MiddlewareHandler } from "hono";
import { TEnv } from "../types/common";

export abstract class ModuleBase {
    // Current app for this module
    public app: OpenAPIHono<TEnv> = new OpenAPIHono<TEnv>();

    // Sub-modules use the parent path
    public subModules: ModuleBase[] = [];

    // Path -> Middleware
    public middlewares: [string, MiddlewareHandler<TEnv, string, {}, Response>][] = [];

    // OpenAPI Route -> Handler
    public controllers: [
        ReturnType<typeof createRoute>,
        RouteHandler<any, TEnv>,
        MiddlewareHandler<TEnv, string, {}, Response> | undefined,
    ][] = [];

    constructor(
        public prefixPath: string,
        public tag: string
    ) {}

    public addMiddleware(path: string, middleware: MiddlewareHandler<TEnv, string, {}, Response>) {
        this.middlewares.push([path, middleware]);
    }

    public addController<P extends string, R extends Omit<RouteConfig, "path"> & { path: P }>(
        routeConfig: ReturnType<typeof createRoute<P, R>>,
        handler: RouteHandler<R, TEnv>,
        middleware?: MiddlewareHandler<TEnv, string, {}, Response>
    ) {
        this.controllers.push([routeConfig, handler, middleware]);
    }

    public integrate(app: OpenAPIHono<TEnv>) {
        // Add middlewares to specified paths
        for (const [path, middleware] of this.middlewares) {
            this.app.use(path, middleware);
        }

        for (const [route, handler, middleware] of this.controllers) {
            // Add tag to route config
            route.tags = [this.tag];

            // If middleware is provided, use it for this route
            if (middleware) {
                this.app.use(route.path, middleware);
            }

            // Register the controller: attach the route with the handler
            this.app.openapi(route, handler);
        }

        // Integrate sub-modules
        for (const subModule of this.subModules) {
            subModule.integrate(this.app);
        }

        // Use prefix path for this module
        app.route(this.prefixPath, this.app);

        return this.app;
    }
}
