import { createFilterDto } from "@/core/dtos/filter.dto";
import { z } from "@hono/zod-openapi";
import { USER_STATUS } from "../schemas/user.schema";

export const GetUserDto = createFilterDto({}, "GetUser");

export const UserDto = z
    .object({
        id: z.uuid(),
        username: z.string().min(1).max(255),
        name: z.string().min(1).max(255).nullable(),
        phone: z.string().min(6).max(32).nullable(),
        gender: z.string().nullable(),
        status: z.enum(USER_STATUS),
        createdAt: z.date().or(z.string()),
        updatedAt: z.date().or(z.string()),
    })
    .openapi("User");

export const UpdateUserDto = z
    .object({
        name: z.string().min(1).max(255).optional(),
        phone: z.string().min(6).max(32).optional(),
        gender: z.string().min(1).max(32).optional(),
    })
    .openapi("UpdateUser");
