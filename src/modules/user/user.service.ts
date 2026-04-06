import { UserRepository } from "./user.repository";
import { NotFoundException } from "@/core/exception/base.exception";
import { ERROR_CODES } from "@/core/config/error-codes.config";
import { ServiceBase } from "@/core/base/service.base";
import { TFilterDto } from "@/core/dtos/filter.dto";
import { z } from "@hono/zod-openapi";
import { UpdateUserDto } from "./dtos/user.dto";

export class UserService extends ServiceBase<UserRepository> {
    async getAllUsers(filter: TFilterDto) {
        return this.repository.findAll(filter);
    }

    async getProfile(id: string) {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND);
        }
        return user;
    }

    async updateUser(id: string, data: z.infer<typeof UpdateUserDto>) {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND);
        }
        return this.repository.update(id, data);
    }
}
