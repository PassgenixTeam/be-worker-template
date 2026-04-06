import { RepositoryBase } from "@/core/base/repository.base";
import { ITEMS_PER_PAGE } from "@/core/dtos/filter.dto";
import { z } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { GetPostDto } from "./dtos/post.dto";
import { NewPost, PostTable } from "./schemas/post.schema";

export class PostRepository extends RepositoryBase {
    async findById(id: string) {
        const [row] = await this.db.select().from(PostTable).where(eq(PostTable.id, id)).limit(1);
        return row;
    }

    async findAll(filter: z.infer<typeof GetPostDto>) {
        const offset = (filter.page - 1) * ITEMS_PER_PAGE;
        const conditions = [];

        if (filter.status) {
            conditions.push(eq(PostTable.status, filter.status));
        }
        if (filter.date) {
            conditions.push(eq(PostTable.date, filter.date));
        }

        return this.db
            .select()
            .from(PostTable)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(PostTable.createdAt))
            .offset(offset)
            .limit(ITEMS_PER_PAGE);
    }

    async create(data: NewPost) {
        const [row] = await this.db.insert(PostTable).values(data).returning();
        return row;
    }

    async update(id: string, data: Partial<NewPost>) {
        const [row] = await this.db
            .update(PostTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(PostTable.id, id))
            .returning();
        return row;
    }

    async delete(id: string) {
        await this.db.delete(PostTable).where(eq(PostTable.id, id));
    }
}
