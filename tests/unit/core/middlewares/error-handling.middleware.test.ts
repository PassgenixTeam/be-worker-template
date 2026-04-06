import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    InternalServerErrorException,
} from "@/core/exception/base.exception";
import { globalExceptionMiddleware } from "@/core/middlewares/global-exception.middleware";
import { queryExceptionMiddleware } from "@/core/middlewares/query-exception.middleware";
import { validationMiddleware } from "@/core/middlewares/validation-exception.middleware";
import { DrizzleQueryError } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createJsonContext = () => {
    return {
        json: vi.fn((payload: unknown, statusCode: number) =>
            new Response(JSON.stringify(payload), {
                status: statusCode,
                headers: { "content-type": "application/json" },
            })
        ),
    } as any;
};

describe("queryExceptionMiddleware", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("maps postgres duplicate key (23505) to ConflictException", async () => {
        const error = new DrizzleQueryError("insert", [], { code: "23505" } as any);

        await expect(queryExceptionMiddleware(error, {} as any)).rejects.toBeInstanceOf(ConflictException);
    });

    it("maps foreign key violation (23503) to BadRequestException", async () => {
        const error = new DrizzleQueryError("insert", [], { code: "23503" } as any);

        await expect(queryExceptionMiddleware(error, {} as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it("maps unknown database errors to InternalServerErrorException", async () => {
        const error = new DrizzleQueryError("select", [], { code: "99999" } as any);

        await expect(queryExceptionMiddleware(error, {} as any)).rejects.toBeInstanceOf(InternalServerErrorException);
    });

    it("rethrows non-drizzle errors", async () => {
        const error = new Error("non-db-error");

        await expect(queryExceptionMiddleware(error, {} as any)).rejects.toBe(error);
    });
});

describe("globalExceptionMiddleware", () => {
    it("returns response from BaseException", async () => {
        const c = createJsonContext();

        const response = await globalExceptionMiddleware(new ForbiddenException("Forbidden"), c);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body).toEqual({
            statusCode: 403,
            message: "Forbidden",
        });
    });

    it("returns response from HTTPException", async () => {
        const c = createJsonContext();

        const response = await globalExceptionMiddleware(new HTTPException(418, { message: "Teapot" }), c);
        const body = await response.json();

        expect(response.status).toBe(418);
        expect(body).toEqual(
            expect.objectContaining({
                statusCode: 418,
                message: "Teapot",
            })
        );
    });

    it("returns 500 for generic errors", async () => {
        const c = createJsonContext();

        const response = await globalExceptionMiddleware(new Error("Something broke"), c);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual(
            expect.objectContaining({
                statusCode: 500,
                message: "Something broke",
            })
        );
    });
});

describe("validationMiddleware", () => {
    it("returns undefined when validation succeeds", () => {
        const c = createJsonContext();
        const result = validationMiddleware({ success: true } as any, c);

        expect(result).toBeUndefined();
    });

    it("returns formatted 422 response when validation fails", async () => {
        const c = createJsonContext();
        const result = validationMiddleware(
            {
                success: false,
                error: {
                    issues: [
                        { path: ["body", "username"], message: "Required" },
                        { path: ["query", "page"], message: "Expected number" },
                    ],
                },
            } as any,
            c
        );

        expect(result).toBeDefined();

        const response = result as Response;
        const body = await response.json();

        expect(response.status).toBe(422);
        expect(body).toEqual({
            statusCode: 422,
            message: "Validation Failed",
            data: [
                { field: "body.username", message: "Required" },
                { field: "query.page", message: "Expected number" },
            ],
        });
    });
});
