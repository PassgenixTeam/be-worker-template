import { ERROR_CODES } from "@/core/config/error-codes.config";
import { NotFoundException } from "@/core/exception/base.exception";
import { UserService } from "@/modules/user/user.service";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUserFixture } from "../../../helpers/factories";

const createRepositoryMock = () => ({
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
});

const createService = (repository = createRepositoryMock()) => {
    const service = new UserService({} as any, repository as any);
    return { service, repository };
};

describe("UserService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("delegates getAllUsers to repository.findAll", async () => {
        const { service, repository } = createService();
        const users = [createUserFixture()];
        const filter = { page: 1, sortOrder: "asc" };

        repository.findAll.mockResolvedValue(users);

        const result = await service.getAllUsers(filter as any);

        expect(repository.findAll).toHaveBeenCalledWith(filter);
        expect(result).toEqual(users);
    });

    it("returns profile when user exists", async () => {
        const { service, repository } = createService();
        const user = createUserFixture();

        repository.findById.mockResolvedValue(user);

        const result = await service.getProfile(user.id);

        expect(repository.findById).toHaveBeenCalledWith(user.id);
        expect(result).toEqual(user);
    });

    it("throws NotFoundException when profile does not exist", async () => {
        const { service, repository } = createService();
        repository.findById.mockResolvedValue(undefined);

        let thrown: unknown;
        try {
            await service.getProfile("missing-user-id");
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(NotFoundException);
        expect((thrown as NotFoundException).errorCode).toBe(ERROR_CODES.USER_NOT_FOUND.code);
    });

    it("throws NotFoundException when updating a missing user", async () => {
        const { service, repository } = createService();
        repository.findById.mockResolvedValue(undefined);

        await expect(service.updateUser("missing-id", { name: "No User" } as any)).rejects.toBeInstanceOf(NotFoundException);

        expect(repository.update).not.toHaveBeenCalled();
    });

    it("updates user when user exists", async () => {
        const { service, repository } = createService();
        const user = createUserFixture();
        const updatePayload = { name: "Updated Name", phone: "0987654321" };
        const updatedUser = createUserFixture(updatePayload);

        repository.findById.mockResolvedValue(user);
        repository.update.mockResolvedValue(updatedUser);

        const result = await service.updateUser(user.id, updatePayload as any);

        expect(repository.findById).toHaveBeenCalledWith(user.id);
        expect(repository.update).toHaveBeenCalledWith(user.id, updatePayload);
        expect(result).toEqual(updatedUser);
    });
});
