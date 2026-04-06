import z from "zod";

export abstract class RoutesBase {
    constructor() {}

    createSuccessResponse(schema: z.ZodType<any> | z.ZodObject<any>) {
        return z.object({
            statusCode: z.number().openapi({ example: 200 }),
            message: z.string().openapi({ example: "Success" }),
            data: schema,
        });
    }

    createErrorResponse = () => {
        return z.object({
            statusCode: z.number().openapi({ example: 400 }),
            message: z.string().openapi({ example: "Error message" }),
            data: z.null().optional(),
        });
    };
}
