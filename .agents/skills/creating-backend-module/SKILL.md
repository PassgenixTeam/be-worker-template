---
name: creating-backend-module
description: Build or update backend modules in the worker using the established Module/Controller/Service/Repository/Routes architecture.
---

# Create Backend Module Skill

Use this skill when creating or updating backend modules in this repository.

## 1. Project Context (Must Follow)

- Runtime: Cloudflare Worker
- HTTP framework: `hono` + `@hono/zod-openapi`
- ORM: `drizzle-orm` (PostgreSQL via Hyperdrive)
- API app entry: `src/api-app.ts`
- Global response shape is enforced by `ControllerBase.sendResponse`
- Validation errors are formatted by `validationMiddleware`
- DB errors are normalized by `queryExceptionMiddleware`

`DATABASE.md` is the source of truth for entities and column names.

## 2. Module File Structure

For module `<module_name>`, create:

```text
src/modules/<module_name>/
├── <module_name>.module.ts
├── <module_name>.routes.ts
├── <module_name>.controller.ts
├── <module_name>.service.ts
├── <module_name>.repository.ts
├── dtos/
│   └── <module_name>.dto.ts
└── schemas/
    └── <table_name>.schema.ts
```

Keep schema files in `schemas/` (plural), matching current codebase.

## 3. Base Class Contract (Required)

Always follow these abstractions:

- Repository: extends `RepositoryBase`
- Service: extends `ServiceBase<Repository>`
- Routes: extends `RoutesBase`
- Controller: extends `ControllerBase<Routes, Repository, Service>`
- Module: extends `ModuleBase`

Do not bypass this architecture.

## 4. Database Schema Rules

When translating entities from `DATABASE.md` to Drizzle schema:

- Table name: snake_case plural (example: `"users"`)
- Use camelCase property names mapped to snake_case DB columns
- For constrained string states (status/role/type/channel/etc.), define TypeScript `enum` + `pgEnum(...)`
- Include required columns:
    - `id` (`idColumn` from `src/db/base-schemas.ts`, UUID PK)
    - `createdAt` mapped to `created_at`
    - `updatedAt` mapped to `updated_at`
- Reuse base timestamp columns from `src/db/base-schemas.ts`:
    - `idColumn`
    - `createdAtColumn`
    - `updatedAtColumn`
- Add `.unique()` for unique identifiers where needed
- For enum columns, prefer:
    - `export enum ENTITY_STATUS { ... }`
    - `export const entityStatusEnum = pgEnum("entity_status", ENTITY_STATUS)`
    - `status: entityStatusEnum("status").notNull().default(ENTITY_STATUS.DEFAULT_VALUE)`
- Do not model enum-like columns as plain `varchar(...).$type<... | string>()` unless there is a strong compatibility reason.
- Export inferred types:
    - `type Entity = typeof table.$inferSelect`
    - `type NewEntity = typeof table.$inferInsert`

## 5. DTO Rules (Zod OpenAPI)

Use `@hono/zod-openapi` `z` in DTO files.

- Response DTO must match API output fields.
- For enum fields, import enums from schema and validate with `z.enum(EnumName)` in response and input DTOs.
- For UUID IDs (default in this repo), use `z.uuid()`.
- For numeric IDs, use `z.number().int()`.
- For nullable DB fields, use `.nullable()`.
- Keep create/update DTOs explicit.
- Use `.refine(...)` when cross-field validation is needed (example: at least one identifier field).

## 6. Repository Rules

Repository handles data access only.

- Use typed signatures that match schema (`id: string` for UUID, `id: number` for numeric PKs).
- Keep methods minimal: `findById`, `findAll`, `create`, `update`, `delete`, and domain-specific lookups.
- Accept typed insert/update payloads (`NewEntity`, `Partial<NewEntity>`).
- No business rule exceptions here.

## 7. Service Rules

Service contains business rules.

- Validate domain state before write operations.
- Throw exceptions from `@/core/exception/base.exception`.
- Use `ERROR_CODES` from `src/core/config/error-codes.config.ts`.
- Keep controller logic out of service.

## 8. Controller Rules

Controllers must be thin.

- In every handler, call `this.initialize(c)` first.
- Read auth identity from `c.get("user")` when endpoint is protected.
- Parse request body and cast to DTO inferred type when needed.
- Return via `this.sendResponse(c, data, statusCode?, message?)`.
- Do not add `try/catch`; let middleware handle exceptions.

## 9. Routes Rules

Define route configs using `createRoute(...)` in `*.routes.ts`.

- Use `this.createSuccessResponse(...)` for success response schema.
- Use DTOs for request body and responses.
- Keep route summaries concise and domain-specific.
- For path params with numeric IDs, validate as numeric (prefer coercion when needed).

## 10. Module Registration Rules

In `<module_name>.module.ts`:

- Instantiate routes + controller.
- Register handlers with `addController`.
- Add module-specific middleware with `addMiddleware` when needed.

Then integrate the module in `src/api-app.ts`:

```ts
import moduleNameModule from "./modules/<module_name>/<module_name>.module";

moduleNameModule.integrate(apiApp);
```

## 11. Auth and Identity Conventions (Current Project)

Current auth flow is identifier-based (not email/password):

- Login/Register identifiers: `phone`, `zaloUserId`, `fbProfileId`
- JWT payload uses UUID `id` string
- `useIdentity` middleware resolves user from token and sets `c.set("user", user)`
- `createAuthenticationMiddleware` filters by `USER_ROLE` values

Do not reintroduce role/email/password assumptions unless explicitly required and approved.

## 12. Error and Response Contract

Success response contract:

```json
{
    "statusCode": 200,
    "message": "OK",
    "data": {}
}
```

Validation failures return `422` with structured field errors (via `validationMiddleware`).

Database exceptions are mapped centrally:

- `23505` -> `ConflictException`
- `23503` -> `BadRequestException`

## 13. Delivery Checklist

1. Align entity fields with `DATABASE.md`.
2. Add or update error codes in `src/core/config/error-codes.config.ts`.
3. Implement schema, DTOs, repository, service, routes, controller, module.
4. Integrate module in `src/api-app.ts`.
5. Generate and apply migrations when schema changes:
    - `pnpm db:generate`
    - `pnpm db:migrate`
6. Run formatting checks:
    - `node_modules/.bin/prettier --check --ignore-unknown <changed-files>`
7. Run type check when available:
    - `node_modules/.bin/tsc --noEmit` (or project-specific equivalent)
8. Run tests for changed module(s):
    - `pnpm test:run`
    - `pnpm test:coverage`

## 14. Reference Implementation

Use these files as the baseline style:

- `src/modules/user/schemas/user.schema.ts`
- `src/modules/user/dtos/user.dto.ts`
- `src/modules/user/user.repository.ts`
- `src/modules/user/user.service.ts`
- `src/modules/user/user.controller.ts`
- `src/modules/auth/dtos/auth.dto.ts`
- `src/modules/auth/auth.service.ts`

## 15. Strategy Template (Recommended Workflow)

Use this sequence for each new entity/module:

1. Lock scope and defaults from `DATABASE.md`:
    - Decide module name, endpoint prefix, and whether endpoints are public or protected.
    - Decide required fields for create DTO (keep update DTO partial).
    - Decide uniqueness/constraints to enforce now vs later.
2. Implement schema first:
    - Create `src/modules/<module>/schemas/<table>.schema.ts`.
    - Use `idColumn`, `createdAtColumn`, `updatedAtColumn`.
    - Keep camelCase properties mapped to snake_case DB columns.
    - Define all domain enums in schema file and back them with `pgEnum(...)`.
3. Implement DTOs second:
    - Add `<Module>Dto`, `Create<Module>Dto`, `Update<Module>Dto`, `<Module>IdParamDto`.
    - Model nullable response fields with `.nullable()`.
    - Reuse schema enums with `z.enum(EnumName)` for enum fields.
    - Add `.refine(...)` for non-empty patch payloads.
4. Implement repository third:
    - Add `findById`, `findAll`, `create`, `update`, `delete`.
    - Keep repository pure data access only.
5. Implement service fourth:
    - Add CRUD business methods and existence checks.
    - Throw typed exceptions with `ERROR_CODES`.
6. Implement routes fifth:
    - Define 5 route configs (`list`, `getById`, `create`, `update`, `delete`) with `createRoute(...)`.
    - Use `this.createSuccessResponse(...)` in all `200` responses.
7. Implement controller sixth:
    - Add one handler per route, `initialize(c)` first in every handler.
    - Parse params with `c.req.valid("param")` and body with `await c.req.json()`.
8. Implement module registration seventh:
    - Instantiate routes/controller and register handlers with `addController(...)`.
9. Integrate module eighth:
    - Import module into `src/api-app.ts` and call `.integrate(apiApp)`.
10. Finalize with migrations and checks:
    - `pnpm db:generate --name <descriptive-name>`
    - `pnpm db:migrate`

## 16. Module CRUD Template

For new module `<module>` and entity `<Entity>`:

1. `src/modules/<module>/schemas/<table>.schema.ts`
    - Export `<entity>Table`, `type <Entity>`, `type New<Entity>`.
    - Export enum definitions + `pgEnum(...)` builders for constrained fields.
2. `src/modules/<module>/dtos/<module>.dto.ts`
    - Export `<Entity>Dto`, `Create<Entity>Dto`, `Update<Entity>Dto`, `<Entity>IdParamDto`.
    - Import schema enums and use `z.enum(...)` for enum fields.
3. `src/modules/<module>/<module>.repository.ts`
    - Class `EntityRepository extends RepositoryBase`.
4. `src/modules/<module>/<module>.service.ts`
    - Class `EntityService extends ServiceBase<EntityRepository>`.
5. `src/modules/<module>/<module>.routes.ts`
    - Class `EntityRoutes extends RoutesBase`.
6. `src/modules/<module>/<module>.controller.ts`
    - Class `EntityController extends ControllerBase<EntityRoutes, EntityRepository, EntityService>`.
7. `src/modules/<module>/<module>.module.ts`
    - Class `EntityModule extends ModuleBase`.
    - Instantiate and register all CRUD handlers.
8. `src/api-app.ts`
    - Import and integrate `<module>Module`.
9. `src/core/config/error-codes.config.ts`
    - Add module-specific error codes (at minimum: `<ENTITY>_NOT_FOUND`).

Code example (replace placeholders with your module names):

`src/modules/<module>/schemas/<table>.schema.ts`

```ts
import { createdAtColumn, idColumn, updatedAtColumn } from "@/db/base-schemas";
import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export enum ENTITY_STATUS {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export const entityStatusEnum = pgEnum("entity_status", ENTITY_STATUS);

export const entityTable = pgTable("entities", {
    id: idColumn,
    name: varchar("name", { length: 255 }).notNull(),
    ownerId: uuid("owner_id"),
    status: entityStatusEnum("status").notNull().default(ENTITY_STATUS.ACTIVE),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
});

export type Entity = typeof entityTable.$inferSelect;
export type NewEntity = typeof entityTable.$inferInsert;
```

`src/modules/<module>/dtos/<module>.dto.ts`

```ts
import { z } from "@hono/zod-openapi";
import { ENTITY_STATUS } from "../schemas/<table>.schema";

const NullableString = z.string().nullable();

export const EntityDto = z
    .object({
        id: z.uuid(),
        name: z.string(),
        ownerId: NullableString,
        status: z.enum(ENTITY_STATUS),
        createdAt: z.date().or(z.string()),
        updatedAt: z.date().or(z.string()),
    })
    .openapi("Entity");

const EntityInputShape = {
    name: z.string().min(1).max(255),
    ownerId: z.uuid().optional(),
    status: z.enum(ENTITY_STATUS).optional(),
};

export const CreateEntityDto = z.object({ ...EntityInputShape }).openapi("CreateEntity");

export const UpdateEntityDto = z
    .object({
        name: EntityInputShape.name.optional(),
        ownerId: EntityInputShape.ownerId,
        status: EntityInputShape.status,
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    })
    .openapi("UpdateEntity");

export const EntityIdParamDto = z.object({ id: z.uuid() }).openapi("EntityIdParam");
```

`src/modules/<module>/<module>.repository.ts`

```ts
import { RepositoryBase } from "@/core/base/repository.base";
import { eq } from "drizzle-orm";
import { entityTable, NewEntity } from "./schemas/<table>.schema";

export class EntityRepository extends RepositoryBase {
    async findById(id: string) {
        const [entity] = await this.db.select().from(entityTable).where(eq(entityTable.id, id)).limit(1);
        return entity;
    }

    async findAll() {
        return this.db.select().from(entityTable);
    }

    async create(data: NewEntity) {
        const [entity] = await this.db.insert(entityTable).values(data).returning();
        return entity;
    }

    async update(id: string, data: Partial<NewEntity>) {
        const [entity] = await this.db.update(entityTable).set(data).where(eq(entityTable.id, id)).returning();
        return entity;
    }

    async delete(id: string) {
        await this.db.delete(entityTable).where(eq(entityTable.id, id));
    }
}
```

`src/modules/<module>/<module>.service.ts`

```ts
import { ServiceBase } from "@/core/base/service.base";
import { ERROR_CODES } from "@/core/config/error-codes.config";
import { NotFoundException } from "@/core/exception/base.exception";
import { z } from "@hono/zod-openapi";
import { CreateEntityDto, UpdateEntityDto } from "./dtos/<module>.dto";
import { EntityRepository } from "./<module>.repository";

export class EntityService extends ServiceBase<EntityRepository> {
    async getById(id: string) {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new NotFoundException(ERROR_CODES.ENTITY_NOT_FOUND);
        }
        return entity;
    }

    async getAll() {
        return this.repository.findAll();
    }

    async create(data: z.infer<typeof CreateEntityDto>) {
        return this.repository.create(data);
    }

    async update(id: string, data: z.infer<typeof UpdateEntityDto>) {
        await this.getById(id);
        return this.repository.update(id, data);
    }

    async delete(id: string) {
        const entity = await this.getById(id);
        await this.repository.delete(id);
        return entity;
    }
}
```

`src/modules/<module>/<module>.routes.ts`

```ts
import { RoutesBase } from "@/core/base/routes.base";
import { createRoute, z } from "@hono/zod-openapi";
import { CreateEntityDto, EntityDto, EntityIdParamDto, UpdateEntityDto } from "./dtos/<module>.dto";

export class EntityRoutes extends RoutesBase {
    listConfig = createRoute({
        method: "get",
        path: "/",
        summary: "List all entities",
        responses: {
            200: {
                description: "List of entities",
                content: { "application/json": { schema: this.createSuccessResponse(z.array(EntityDto)) } },
            },
        },
    });

    getByIdConfig = createRoute({
        method: "get",
        path: "/{id}",
        summary: "Get entity by id",
        request: { params: EntityIdParamDto },
        responses: {
            200: {
                description: "Entity detail",
                content: { "application/json": { schema: this.createSuccessResponse(EntityDto) } },
            },
        },
    });

    createConfig = createRoute({
        method: "post",
        path: "/",
        summary: "Create entity",
        request: { body: { content: { "application/json": { schema: CreateEntityDto } } } },
        responses: {
            200: {
                description: "Created entity",
                content: { "application/json": { schema: this.createSuccessResponse(EntityDto) } },
            },
        },
    });

    updateConfig = createRoute({
        method: "patch",
        path: "/{id}",
        summary: "Update entity",
        request: {
            params: EntityIdParamDto,
            body: { content: { "application/json": { schema: UpdateEntityDto } } },
        },
        responses: {
            200: {
                description: "Updated entity",
                content: { "application/json": { schema: this.createSuccessResponse(EntityDto) } },
            },
        },
    });

    deleteConfig = createRoute({
        method: "delete",
        path: "/{id}",
        summary: "Delete entity",
        request: { params: EntityIdParamDto },
        responses: {
            200: {
                description: "Deleted entity",
                content: { "application/json": { schema: this.createSuccessResponse(EntityDto) } },
            },
        },
    });
}
```

`src/modules/<module>/<module>.controller.ts`

```ts
import { ControllerBase } from "@/core/base/controller.base";
import { TContext, TEnv } from "@/core/types/common";
import { RouteHandler, z } from "@hono/zod-openapi";
import { CreateEntityDto, EntityIdParamDto, UpdateEntityDto } from "./dtos/<module>.dto";
import { EntityRepository } from "./<module>.repository";
import { EntityRoutes } from "./<module>.routes";
import { EntityService } from "./<module>.service";

export class EntityController extends ControllerBase<EntityRoutes, EntityRepository, EntityService> {
    initialize(c: TContext): void {
        this.repository = new EntityRepository(c);
        this.service = new EntityService(c, this.repository);
    }

    public list: RouteHandler<typeof this.routes.listConfig, TEnv> = async (c) => {
        this.initialize(c);
        return this.sendResponse(c, await this.service!.getAll());
    };

    public getById: RouteHandler<typeof this.routes.getByIdConfig, TEnv> = async (c) => {
        this.initialize(c);
        const { id } = c.req.valid("param") as z.infer<typeof EntityIdParamDto>;
        return this.sendResponse(c, await this.service!.getById(id));
    };

    public create: RouteHandler<typeof this.routes.createConfig, TEnv> = async (c) => {
        this.initialize(c);
        const body = (await c.req.json()) as z.infer<typeof CreateEntityDto>;
        return this.sendResponse(c, await this.service!.create(body));
    };

    public update: RouteHandler<typeof this.routes.updateConfig, TEnv> = async (c) => {
        this.initialize(c);
        const { id } = c.req.valid("param") as z.infer<typeof EntityIdParamDto>;
        const body = (await c.req.json()) as z.infer<typeof UpdateEntityDto>;
        return this.sendResponse(c, await this.service!.update(id, body));
    };

    public delete: RouteHandler<typeof this.routes.deleteConfig, TEnv> = async (c) => {
        this.initialize(c);
        const { id } = c.req.valid("param") as z.infer<typeof EntityIdParamDto>;
        return this.sendResponse(c, await this.service!.delete(id));
    };
}
```

`src/modules/<module>/<module>.module.ts`

```ts
import { ModuleBase } from "@/core/base/module.base";
import { EntityController } from "./<module>.controller";
import { EntityRoutes } from "./<module>.routes";

export class EntityModule extends ModuleBase {}

const entityModule = new EntityModule("/<module-plural>", "Entity");
const routes = new EntityRoutes();
const controller = new EntityController(routes);

entityModule.addController(routes.listConfig, controller.list);
entityModule.addController(routes.getByIdConfig, controller.getById);
entityModule.addController(routes.createConfig, controller.create);
entityModule.addController(routes.updateConfig, controller.update);
entityModule.addController(routes.deleteConfig, controller.delete);

export default entityModule;
```

`src/api-app.ts`

```ts
import entityModule from "./modules/<module>/<module>.module";

entityModule.integrate(apiApp);
```

`src/core/config/error-codes.config.ts`

```ts
export const ERROR_CODES = {
    // ...existing
    MODULE_ERROR: { code: 5000, message: "Module error occurred" },
} as const;
```

## 17. CRUD Acceptance Test Template

Validate these cases after implementation:

1. `POST /api/<modules>` with minimum required fields returns `200` and wrapped data.
2. Invalid create payload returns `422` with validation error structure.
3. `GET /api/<modules>` returns wrapped array.
4. `GET /api/<modules>/{id}` unknown id returns `404` with module not-found error.
5. `PATCH /api/<modules>/{id}` with valid partial payload returns updated entity.
6. `PATCH /api/<modules>/{id}` with empty body returns `422`.
7. `DELETE /api/<modules>/{id}` succeeds once; repeated delete returns `404`.
8. OpenAPI `/docs` shows the module tag and all CRUD endpoints.

## 18. How to Write Test Cases (Vitest)

This repository uses `vitest` with `@cloudflare/vitest-pool-workers`.

### 18.1 Test Folder Convention

Use these locations to keep tests easy to discover:

```text
tests/
├── helpers/
│   └── factories.ts
├── unit/
│   ├── modules/<module>/<module>.service.test.ts
│   ├── modules/<module>/<module>.controller.test.ts
│   └── core/middlewares/<middleware>.test.ts
└── integration/
    └── api/<module>.crud.test.ts
```

### 18.2 Test Pyramid for This Architecture

Prioritize tests in this order:

1. Service unit tests (primary): verify business rules, ownership rules, and exception mapping.
2. Middleware unit tests: verify auth guards and error formatting behavior.
3. API integration tests: verify request validation, route wiring, and response contract.

### 18.3 Service Unit Test Pattern (Recommended)

Use repository mocks and test only service behavior.

```ts
import { ERROR_CODES } from "@/core/config/error-codes.config";
import { NotFoundException } from "@/core/exception/base.exception";
import { EntityService } from "@/modules/<module>/<module>.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createRepositoryMock = () => ({
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
});

const createService = (repository = createRepositoryMock()) => {
    const service = new EntityService({} as any, repository as any);
    return { service, repository };
};

describe("EntityService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws NotFoundException when entity does not exist", async () => {
        const { service, repository } = createService();
        repository.findById.mockResolvedValue(undefined);

        await expect(service.getById("missing-id")).rejects.toBeInstanceOf(NotFoundException);
        await expect(service.getById("missing-id")).rejects.toMatchObject({
            errorCode: ERROR_CODES.ENTITY_NOT_FOUND.code,
        });
    });
});
```

### 18.4 Middleware Unit Test Pattern

Build a minimal mock context for middleware and assert status/message shape.

```ts
const c = {
    json: vi.fn((payload, status) => new Response(JSON.stringify(payload), { status })),
    get: vi.fn(),
} as any;
```

For auth middleware, verify:

1. Missing `user` -> `ForbiddenException`.
2. Role not allowed -> `ForbiddenException`.
3. Allowed role -> `next()` is called exactly once.

### 18.5 API Integration Test Pattern

Use `SELF.fetch(...)` from `cloudflare:test` to exercise real route wiring.

```ts
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Entity API", () => {
    it("returns wrapped success response", async () => {
        const res = await SELF.fetch("http://example.com/api/<modules>", {
            method: "GET",
        });

        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body).toEqual(
            expect.objectContaining({
                statusCode: 200,
                message: "OK",
            })
        );
    });
});
```

For protected endpoints, obtain a token from auth endpoints during test setup instead of hardcoding JWTs.

### 18.6 Assertion Rules (What to Verify)

For each test case, assert all of these when applicable:

1. HTTP status code.
2. Response contract (`statusCode`, `message`, `data`).
3. Domain-specific `errorCode` for failures.
4. Side effects (repository calls, update/delete invocation counts).

### 18.7 Minimum Cases Per New CRUD Module

At minimum, write tests for:

1. `create` success and invalid payload (`422`).
2. `getAll` success.
3. `getById` not found (`404`).
4. `update` success and empty payload (`422` when applicable).
5. `delete` success and repeated delete (`404`).
6. Authorization checks for protected routes (`403`/`401` depending on contract).

### 18.8 Test Execution Commands

Use the project scripts:

```bash
pnpm test:run
pnpm test:coverage
```

Run a single file when iterating:

```bash
pnpm test:run -- tests/unit/modules/<module>/<module>.service.test.ts
```
