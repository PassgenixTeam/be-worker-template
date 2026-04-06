import { z } from "@hono/zod-openapi";

export const ITEMS_PER_PAGE = 10;

const filterBase = {
    page: z.coerce.number().int().min(1).optional().default(1),
    sortKey: z.string().min(1).max(64).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    search: z.string().trim().min(1).max(255).optional(),
};

export const FilterDto = z
    .object({
        ...filterBase,
    })
    .openapi("Filter");

export const createFilterDto = <T extends z.ZodRawShape>(shape: T, openApiName?: string) => {
    const schema = z.object({
        ...filterBase,
        ...shape,
    });

    return openApiName ? schema.openapi(openApiName) : schema;
};

export type TFilterDto = z.infer<typeof FilterDto>;
