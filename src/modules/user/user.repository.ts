import { RepositoryBase } from "@/core/base/repository.base";
import { ITEMS_PER_PAGE, TFilterDto } from "@/core/dtos/filter.dto";
import { eq, or, type SQL } from "drizzle-orm";
import { NewUser, userTable } from "./schemas/user.schema";

type UserIdentifier = {
    username?: string;
    phone?: string;
};

export class UserRepository extends RepositoryBase {
    async findById(id: string) {
        const [user] = await this.db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
        return user;
    }

    async findByIdentifier(identifier: UserIdentifier) {
        const conditions: SQL[] = [];

        if (identifier.username) {
            conditions.push(eq(userTable.username, identifier.username));
        }

        if (identifier.phone) {
            conditions.push(eq(userTable.phone, identifier.phone));
        }

        if (conditions.length === 0) {
            return undefined;
        }

        const [user] = await this.db
            .select()
            .from(userTable)
            .where(or(...conditions))
            .limit(1);
        return user;
    }

    async findAll(filter: TFilterDto) {
        const offset = (filter.page - 1) * ITEMS_PER_PAGE;

        return this.db.select().from(userTable).offset(offset).limit(ITEMS_PER_PAGE);
    }

    async create(data: NewUser) {
        const [user] = await this.db.insert(userTable).values(data).returning();
        return user;
    }

    async update(id: string, data: Partial<NewUser>) {
        const [user] = await this.db.update(userTable).set(data).where(eq(userTable.id, id)).returning();
        return user;
    }

    async delete(id: string) {
        await this.db.delete(userTable).where(eq(userTable.id, id));
    }
}
