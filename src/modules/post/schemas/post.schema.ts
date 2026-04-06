import { createdAtColumn, idColumn, updatedAtColumn } from "@/db/base-schemas";
import { userTable } from "@/modules/user/schemas/user.schema";
import { pgEnum, pgTable, text, uuid, varchar, date } from "drizzle-orm/pg-core";

export enum POST_STATUS {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
}

export const postStatusEnum = pgEnum("post_status", POST_STATUS);

export const PostTable = pgTable("posts", {
    id: idColumn,
    userId: uuid("user_id")
        .references(() => userTable.id)
        .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    date: date("date", { mode: "date" }).notNull(),
    content: text("content").notNull(),
    status: postStatusEnum("status").notNull().default(POST_STATUS.DRAFT),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
});

export type Post = typeof PostTable.$inferSelect;
export type NewPost = typeof PostTable.$inferInsert;
