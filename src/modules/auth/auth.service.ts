import { z } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { UserRepository } from "@/modules/user/user.repository";
import { RegisterDto, LoginDto } from "./dtos/auth.dto";
import { BadRequestException, ConflictException, UnauthorizedException } from "@/core/exception/base.exception";
import { ERROR_CODES } from "@/core/config/error-codes.config";
import { ServiceBase } from "@/core/base/service.base";
import { USER_STATUS } from "@/modules/user/schemas/user.schema";

export class AuthService extends ServiceBase<UserRepository> {
    async register(data: z.infer<typeof RegisterDto>, env: any) {
        const existingUser = await this.repository.findByIdentifier({
            username: data.username,
            phone: data.phone,
        });

        if (existingUser) {
            throw new ConflictException(ERROR_CODES.USER_IDENTIFIER_ALREADY_EXISTS);
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const { password: _, ...rest } = data;
        const user = await this.repository.create({
            ...rest,
            passwordHash,
            status: USER_STATUS.ACTIVE,
        });

        const token = await sign({ id: user.id }, env.JWT_SECRET);
        return { user, token };
    }

    async login(data: z.infer<typeof LoginDto>, env: any) {
        const user = await this.repository.findByIdentifier({ username: data.username, phone: data.phone });
        if (!user) {
            throw new BadRequestException(ERROR_CODES.INVALID_LOGIN_IDENTIFIER);
        }

        if (!user.passwordHash) {
            throw new UnauthorizedException(ERROR_CODES.INVALID_CREDENTIALS);
        }

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException(ERROR_CODES.INVALID_CREDENTIALS);
        }

        const token = await sign({ id: user.id }, env.JWT_SECRET);
        return { user, token };
    }
}
