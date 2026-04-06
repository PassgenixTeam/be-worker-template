import { z } from "@hono/zod-openapi";
import { ServiceBase } from "@/core/base/service.base";
import { ForbiddenException, NotFoundException } from "@/core/exception/base.exception";
import { ERROR_CODES } from "@/core/config/error-codes.config";
import { CreatePostDto, GetPostDto, UpdatePostDto } from "./dtos/post.dto";
import { PostRepository } from "./post.repository";

export class PostService extends ServiceBase<PostRepository> {
    async getById(id: string) {
        const row = await this.repository.findById(id);
        if (!row) throw new NotFoundException(ERROR_CODES.POST_NOT_FOUND);
        return row;
    }

    async getAll(filter: z.infer<typeof GetPostDto>) {
        return this.repository.findAll(filter);
    }

    async create(data: z.infer<typeof CreatePostDto>, userId: string) {
        return this.repository.create({ ...data, date: new Date(), userId });
    }

    async update(id: string, data: z.infer<typeof UpdatePostDto>, userId: string) {
        const row = await this.getById(id);
        if (row.userId && row.userId !== userId) {
            throw new ForbiddenException("You do not own this post");
        }
        return this.repository.update(id, data);
    }

    async delete(id: string, userId: string) {
        const row = await this.getById(id);
        if (row.userId && row.userId !== userId) {
            throw new ForbiddenException("You do not own this post");
        }
        await this.repository.delete(id);
        return row;
    }
}
