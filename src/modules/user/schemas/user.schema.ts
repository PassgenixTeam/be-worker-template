import { createdAtColumn, idColumn, updatedAtColumn } from "@/db/base-schemas";
import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export enum USER_ROLE {
    USER = "USER",
    ADMIN = "ADMIN",
}

export const userRoleEnum = pgEnum("user_role", USER_ROLE);

export enum USER_STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export const userStatusEnum = pgEnum("user_status", USER_STATUS);

export const userTable = pgTable("users", {
    id: idColumn,
    username: varchar("username", { length: 255 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    name: varchar("name", { length: 255 }),
    phone: varchar("phone", { length: 32 }),
    gender: varchar("gender", { length: 32 }),
    status: userStatusEnum("status").notNull().default(USER_STATUS.ACTIVE),
    role: userRoleEnum("role").notNull().default(USER_ROLE.USER),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
});

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;
