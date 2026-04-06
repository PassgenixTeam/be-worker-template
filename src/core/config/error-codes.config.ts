export const ERROR_CODES = {
    // Common Errors (0-999)
    INTERNAL_ERROR: { code: 500, message: "Internal Server Error" },
    UNAUTHORIZED: { code: 401, message: "Unauthorized" },
    FORBIDDEN: { code: 403, message: "Forbidden" },
    BAD_REQUEST: { code: 400, message: "Bad Request" },

    // User & Auth Module (1001-1999)
    USER_NOT_FOUND: { code: 1001, message: "User is not found" },
    EMAIL_ALREADY_EXISTS: { code: 1002, message: "Email already exists" },
    INVALID_CREDENTIALS: { code: 1003, message: "Invalid email or password" },
    PASSWORD_TOO_SHORT: { code: 1004, message: "Password is too short" },
    USER_IDENTIFIER_ALREADY_EXISTS: { code: 1005, message: "User with provided identifier already exists" },
    INVALID_LOGIN_IDENTIFIER: { code: 1006, message: "Invalid login identifier" },

    // Post Module (2001-2009)
    POST_NOT_FOUND: { code: 2001, message: "Post is not found" },
} as const;

export type TErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
