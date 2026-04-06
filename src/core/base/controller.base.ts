import { ContentfulStatusCode } from "hono/utils/http-status";
import { TContext } from "../types/common";
import { RepositoryBase } from "./repository.base";
import { RoutesBase } from "./routes.base";
import { ServiceBase } from "./service.base";

export abstract class ControllerBase<
    Routes extends RoutesBase,
    Repository extends RepositoryBase,
    Service extends ServiceBase<Repository>,
> {
    public repository: Repository | null = null;
    public service: Service | null = null;

    constructor(public readonly routes: Routes) {}

    abstract initialize(c: TContext): void;

    sendResponse = (c: TContext, data: any, statusCode: ContentfulStatusCode = 200, message: string = "OK"): any => {
        return c.json(
            {
                data,
                statusCode: statusCode as number,
                message,
            },
            statusCode
        );
    };
}
