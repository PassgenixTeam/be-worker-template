import * as p from "drizzle-orm/pg-core";

export const idColumn = p.uuid("id").defaultRandom().primaryKey().notNull();

export const createdAtColumn = p.timestamp("created_at", { mode: "date" }).notNull().defaultNow();
export const updatedAtColumn = p
    .timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
