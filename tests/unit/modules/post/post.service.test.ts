import { ERROR_CODES } from "@/core/config/error-codes.config";
import { ForbiddenException, NotFoundException } from "@/core/exception/base.exception";
import { PostService } from "@/modules/post/post.service";
import { POST_STATUS } from "@/modules/post/schemas/post.schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPostFixture } from "../../../helpers/factories";

const createRepositoryMock = () => ({
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
});

const createService = (repository = createRepositoryMock()) => {
    const service = new PostService({} as any, repository as any);
    return { service, repository };
};

describe("PostService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns post detail when post exists", async () => {
        const { service, repository } = createService();
        const post = createPostFixture();

        repository.findById.mockResolvedValue(post);

        const result = await service.getById(post.id);

        expect(repository.findById).toHaveBeenCalledWith(post.id);
        expect(result).toEqual(post);
    });

    it("throws NotFoundException when post does not exist", async () => {
        const { service, repository } = createService();
        repository.findById.mockResolvedValue(undefined);

        let thrown: unknown;
        try {
            await service.getById("missing-post-id");
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(NotFoundException);
        expect((thrown as NotFoundException).errorCode).toBe(ERROR_CODES.POST_NOT_FOUND.code);
    });

    it("delegates getAll to repository.findAll", async () => {
        const { service, repository } = createService();
        const posts = [createPostFixture()];
        const filter = { page: 1, sortOrder: "asc", status: POST_STATUS.DRAFT };

        repository.findAll.mockResolvedValue(posts);

        const result = await service.getAll(filter as any);

        expect(repository.findAll).toHaveBeenCalledWith(filter);
        expect(result).toEqual(posts);
    });

    it("creates post with current date and userId", async () => {
        const { service, repository } = createService();
        const userId = "11111111-1111-4111-8111-111111111111";
        const input = {
            title: "New title",
            content: "New content",
            status: POST_STATUS.PUBLISHED,
        };
        const created = createPostFixture({ ...input, userId, status: POST_STATUS.PUBLISHED });

        repository.create.mockResolvedValue(created);

        const result = await service.create(input as any, userId);

        expect(repository.create).toHaveBeenCalledTimes(1);
        const createPayload = repository.create.mock.calls[0]![0];
        expect(createPayload).toMatchObject({
            title: input.title,
            content: input.content,
            status: input.status,
            userId,
        });
        expect(createPayload.date).toBeInstanceOf(Date);
        expect(result).toEqual(created);
    });

    it("throws ForbiddenException when updating another user's post", async () => {
        const { service, repository } = createService();
        const post = createPostFixture({ userId: "owner-id" });

        repository.findById.mockResolvedValue(post);

        await expect(
            service.update(post.id, { title: "Updated" } as any, "different-user-id")
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(repository.update).not.toHaveBeenCalled();
    });

    it("updates post when requester is owner", async () => {
        const { service, repository } = createService();
        const post = createPostFixture();
        const updated = createPostFixture({ title: "Updated title" });

        repository.findById.mockResolvedValue(post);
        repository.update.mockResolvedValue(updated);

        const result = await service.update(post.id, { title: "Updated title" } as any, post.userId);

        expect(repository.update).toHaveBeenCalledWith(post.id, { title: "Updated title" });
        expect(result).toEqual(updated);
    });

    it("deletes post and returns deleted row when requester is owner", async () => {
        const { service, repository } = createService();
        const post = createPostFixture();

        repository.findById.mockResolvedValue(post);
        repository.delete.mockResolvedValue(undefined);

        const result = await service.delete(post.id, post.userId);

        expect(repository.delete).toHaveBeenCalledWith(post.id);
        expect(result).toEqual(post);
    });

    it("throws ForbiddenException when deleting another user's post", async () => {
        const { service, repository } = createService();
        const post = createPostFixture({ userId: "owner-id" });

        repository.findById.mockResolvedValue(post);

        await expect(service.delete(post.id, "different-user-id")).rejects.toBeInstanceOf(ForbiddenException);

        expect(repository.delete).not.toHaveBeenCalled();
    });
});
