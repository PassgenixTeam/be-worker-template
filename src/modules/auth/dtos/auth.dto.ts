import { z } from "@hono/zod-openapi";
import { UserDto } from "@/modules/user/dtos/user.dto";

export const LoginDto = z
    .object({
        username: z.string().min(6).max(32).optional(),
        phone: z.string().min(6).max(32).optional(),
        password: z.string().min(6).max(128),
    })
    .refine((data) => data.username || data.phone, {
        message: "Either username or phone must be provided",
    })
    .openapi("LoginRequest");

export const RegisterDto = z
    .object({
        username: z.string().min(6).max(32),
        password: z.string().min(6).max(128),
        name: z.string().min(1).max(255).optional(),
        phone: z.string().min(6).max(32).optional(),
        gender: z.string().min(1).max(32).optional(),
    })
    .openapi("RegisterRequest");

export const AuthResponseDto = z
    .object({
        user: UserDto,
        token: z.string(),
    })
    .openapi("AuthResponse");
