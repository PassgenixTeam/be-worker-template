import { ERROR_CODES } from "@/core/config/error-codes.config";
import { BadRequestException, ConflictException, UnauthorizedException } from "@/core/exception/base.exception";
import { AuthService } from "@/modules/auth/auth.service";
import { USER_STATUS } from "@/modules/user/schemas/user.schema";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createUserFixture } from "../../../helpers/factories";

vi.mock("hono/jwt", () => ({
    sign: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

const env = { JWT_SECRET: "test-secret" };
const signMock = sign as unknown as Mock;
const bcryptHashMock = bcrypt.hash as unknown as Mock;
const bcryptCompareMock = bcrypt.compare as unknown as Mock;

const createRepositoryMock = () => ({
    findByIdentifier: vi.fn(),
    create: vi.fn(),
});

const createService = (repository = createRepositoryMock()) => {
    const service = new AuthService({} as any, repository as any);
    return { service, repository };
};

describe("AuthService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("register", () => {
        it("creates user with hashed password and signed token", async () => {
            const { service, repository } = createService();
            const input = {
                username: "new-user",
                password: "plain-password",
                phone: "0123456789",
                name: "New User",
                gender: "MALE",
            };
            const createdUser = createUserFixture({
                username: input.username,
                phone: input.phone,
            });

            repository.findByIdentifier.mockResolvedValue(undefined);
            bcryptHashMock.mockResolvedValue("hashed-password");
            repository.create.mockResolvedValue(createdUser);
            signMock.mockResolvedValue("jwt-token");

            const result = await service.register(input as any, env);

            expect(repository.findByIdentifier).toHaveBeenCalledWith({
                username: input.username,
                phone: input.phone,
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);
            expect(repository.create).toHaveBeenCalledTimes(1);

            const createPayload = repository.create.mock.calls[0]![0];
            expect(createPayload).toMatchObject({
                username: input.username,
                phone: input.phone,
                name: input.name,
                gender: input.gender,
                passwordHash: "hashed-password",
                status: USER_STATUS.ACTIVE,
            });
            expect(createPayload).not.toHaveProperty("password");
            expect(sign).toHaveBeenCalledWith({ id: createdUser.id }, env.JWT_SECRET);
            expect(result).toEqual({ user: createdUser, token: "jwt-token" });
        });

        it("throws ConflictException when identifier already exists", async () => {
            const { service, repository } = createService();
            repository.findByIdentifier.mockResolvedValue(createUserFixture());

            let thrown: unknown;
            try {
                await service.register(
                    {
                        username: "existing-user",
                        password: "password",
                        phone: "0123456789",
                    } as any,
                    env
                );
            } catch (error) {
                thrown = error;
            }

            expect(thrown).toBeInstanceOf(ConflictException);
            expect((thrown as ConflictException).errorCode).toBe(ERROR_CODES.USER_IDENTIFIER_ALREADY_EXISTS.code);
            expect(repository.create).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("throws BadRequestException for invalid identifier", async () => {
            const { service, repository } = createService();
            repository.findByIdentifier.mockResolvedValue(undefined);

            await expect(
                service.login(
                    {
                        username: "missing-user",
                        password: "password",
                    } as any,
                    env
                )
            ).rejects.toBeInstanceOf(BadRequestException);

            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it("throws UnauthorizedException when user has no password hash", async () => {
            const { service, repository } = createService();
            repository.findByIdentifier.mockResolvedValue(
                createUserFixture({
                    passwordHash: null,
                })
            );

            await expect(
                service.login(
                    {
                        username: "tester001",
                        password: "password",
                    } as any,
                    env
                )
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it("throws UnauthorizedException when password is invalid", async () => {
            const { service, repository } = createService();
            repository.findByIdentifier.mockResolvedValue(createUserFixture());
            bcryptCompareMock.mockResolvedValue(false);

            await expect(
                service.login(
                    {
                        username: "tester001",
                        password: "wrong-password",
                    } as any,
                    env
                )
            ).rejects.toBeInstanceOf(UnauthorizedException);

            expect(sign).not.toHaveBeenCalled();
        });

        it("returns user and signed token on successful login", async () => {
            const { service, repository } = createService();
            const user = createUserFixture();

            repository.findByIdentifier.mockResolvedValue(user);
            bcryptCompareMock.mockResolvedValue(true);
            signMock.mockResolvedValue("signed-token");

            const result = await service.login(
                {
                    username: user.username,
                    password: "plain-password",
                } as any,
                env
            );

            expect(bcrypt.compare).toHaveBeenCalledWith("plain-password", user.passwordHash);
            expect(sign).toHaveBeenCalledWith({ id: user.id }, env.JWT_SECRET);
            expect(result).toEqual({ user, token: "signed-token" });
        });
    });
});
