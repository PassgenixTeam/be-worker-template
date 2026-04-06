import { TContext, TEnv } from "../types/common";

export abstract class RepositoryBase {
    public db: TEnv["Variables"]["db"];

    constructor(public readonly c: TContext) {
        this.db = c.get("db");
    }
}
