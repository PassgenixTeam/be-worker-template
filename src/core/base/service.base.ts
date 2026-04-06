import { TContext } from "../types/common";
import { RepositoryBase } from "./repository.base";

export abstract class ServiceBase<Repository extends RepositoryBase> {
    constructor(
        public readonly c: TContext,
        public readonly repository: Repository
    ) {}
}
