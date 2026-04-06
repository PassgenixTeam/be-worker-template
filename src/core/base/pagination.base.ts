import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce.number().optional().default(1),
    take: z.coerce.number().optional().default(10),
    sortKey: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

export class PaginationResponse<T> {
    items: T[];
    meta: {
        page: number;
        take: number;
        totalItems: number;
        totalPages: number;
        itemCount: number;
    };

    constructor({ items, take, page, totalItems }: { items: T[]; take: number; page: number; totalItems: number }) {
        this.items = items;
        this.meta = {
            page,
            take,
            totalItems,
            totalPages: Math.ceil(totalItems / take),
            itemCount: items.length,
        };
    }
}
