import { ForbiddenException } from "@/core/exception/base.exception";
import { createAuthMiddleware } from "@/core/middlewares/authorization.middleware";
import { USER_ROLE } from "@/modules/user/schemas/user.schema";
import { describe, expect, it, vi } from "vitest";
import { createUserFixture } from "../../../helpers/factories";

describe("createAuthMiddleware", () => {
    it("throws ForbiddenException when user is missing", async () => {
        const middleware = createAuthMiddleware(USER_ROLE.USER);
        const c = {
            get: vi.fn().mockReturnValue(undefined),
        } as any;
        const next = vi.fn();

        await expect(middleware(c, next)).rejects.toBeInstanceOf(ForbiddenException);

        expect(next).not.toHaveBeenCalled();
    });

    it("throws ForbiddenException when user role is not allowed", async () => {
        const middleware = createAuthMiddleware(USER_ROLE.USER);
        const c = {
            get: vi.fn().mockReturnValue(
                createUserFixture({
                    role: USER_ROLE.ADMIN,
                })
            ),
        } as any;
        const next = vi.fn();

        await expect(middleware(c, next)).rejects.toBeInstanceOf(ForbiddenException);

        expect(next).not.toHaveBeenCalled();
    });

    it("calls next when user role is allowed", async () => {
        const middleware = createAuthMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN);
        const c = {
            get: vi.fn().mockReturnValue(
                createUserFixture({
                    role: USER_ROLE.USER,
                })
            ),
        } as any;
        const next = vi.fn(async () => Promise.resolve());

        await middleware(c, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
