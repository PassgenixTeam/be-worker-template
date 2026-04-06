import { TEnv } from "@/core/types/common";
import { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { BaseException } from "../exception/base.exception";

export const globalExceptionMiddleware: ErrorHandler<TEnv> = async (err, c) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errorCode = undefined;
    let data = null;

    if (err instanceof BaseException) {
        statusCode = err.status;
        message = err.message;
        errorCode = err.errorCode;
        data = err.data;
    } else if (err instanceof HTTPException) {
        statusCode = err.status;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    // Custom status support for plain objects if any
    if (!(err instanceof HTTPException) && (err as any).status) {
        statusCode = (err as any).status;
    }

    return c.json(
        {
            statusCode,
            message,
            errorCode,
            data,
        },
        statusCode as ContentfulStatusCode
    );
};
