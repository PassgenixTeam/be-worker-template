import { POST_STATUS } from "@/modules/post/schemas/post.schema";
import { USER_ROLE, USER_STATUS } from "@/modules/user/schemas/user.schema";

export type UserFixture = {
    id: string;
    username: string;
    passwordHash: string | null;
    name: string | null;
    phone: string | null;
    gender: string | null;
    status: USER_STATUS;
    role: USER_ROLE;
    createdAt: Date;
    updatedAt: Date;
};

export const createUserFixture = (overrides: Partial<UserFixture> = {}): UserFixture => ({
    id: "11111111-1111-4111-8111-111111111111",
    username: "tester001",
    passwordHash: "hashed-password",
    name: "Test User",
    phone: "0123456789",
    gender: "MALE",
    status: USER_STATUS.ACTIVE,
    role: USER_ROLE.USER,
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    ...overrides,
});

export type PostFixture = {
    id: string;
    userId: string;
    title: string;
    date: Date;
    content: string;
    status: POST_STATUS;
    createdAt: Date;
    updatedAt: Date;
};

export const createPostFixture = (overrides: Partial<PostFixture> = {}): PostFixture => ({
    id: "22222222-2222-4222-8222-222222222222",
    userId: "11111111-1111-4111-8111-111111111111",
    title: "Testing post",
    date: new Date("2026-04-01T00:00:00.000Z"),
    content: "Post content",
    status: POST_STATUS.DRAFT,
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    ...overrides,
});
