import { TEnv } from "@/core/types/common";
import { DrizzleQueryError } from "drizzle-orm";
import { ErrorHandler } from "hono";
import { BadRequestException, ConflictException, InternalServerErrorException } from "../exception/base.exception";

export const queryExceptionMiddleware: ErrorHandler<TEnv> = async (error, c) => {
    if (error instanceof DrizzleQueryError) {
        const code = (error.cause as any)?.code;

        // Handle Unique Violation (e.g. duplicate user identifier)
        if (code === "23505") {
            throw new ConflictException("Resource already exists");
        }

        // Handle Foreign Key Violation
        if (code === "23503") {
            throw new BadRequestException("Invalid reference to related resource");
        }

        // Log the actual error for debugging
        console.error("Database Error:", error);

        // Default to Internal Server Error for other DB issues (like connection failures)
        // to avoid leaking sensitive details
        throw new InternalServerErrorException("Database operation failed");
    }

    throw error;
};
