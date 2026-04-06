import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { TErrorCode } from "../config/error-codes.config";

export class BaseException extends HTTPException {
    public errorCode?: number;
    public data?: any;

    constructor(error: string | TErrorCode, statusCode: ContentfulStatusCode = 400, data?: any) {
        const message = typeof error === "string" ? error : error.message;
        super(statusCode, { message });
        this.name = this.constructor.name;
        this.data = data;
        if (typeof error !== "string") {
            this.errorCode = error.code;
        }
    }
}

export class BadRequestException extends BaseException {
    constructor(error: string | TErrorCode = "Bad Request", data?: any) {
        super(error, 400, data);
    }
}

export class UnauthorizedException extends BaseException {
    constructor(error: string | TErrorCode = "Unauthorized", data?: any) {
        super(error, 401, data);
    }
}

export class ForbiddenException extends BaseException {
    constructor(error: string | TErrorCode = "Forbidden", data?: any) {
        super(error, 403, data);
    }
}

export class NotFoundException extends BaseException {
    constructor(error: string | TErrorCode = "Not Found", data?: any) {
        super(error, 404, data);
    }
}

export class InternalServerErrorException extends BaseException {
    constructor(error: string | TErrorCode = "Internal Server Error", data?: any) {
        super(error, 500, data);
    }
}

export class ConflictException extends BaseException {
    constructor(error: string | TErrorCode = "Conflict", data?: any) {
        super(error, 409, data);
    }
}
