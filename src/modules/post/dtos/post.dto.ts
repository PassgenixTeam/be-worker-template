import { createFilterDto } from "@/core/dtos/filter.dto";
import { z } from "@hono/zod-openapi";
import { POST_STATUS } from "../schemas/post.schema";

export const GetPostDto = createFilterDto(
    {
        status: z.enum(POST_STATUS).optional(),
        date: z.date().optional(),
    },
    "GetPost"
);

export const PostDto = z
    .object({
        id: z.uuid(),
        userId: z.uuid(),
        title: z.string(),
        date: z.date(),
        content: z.string(),
        status: z.enum(POST_STATUS),
        createdAt: z.date().or(z.string()),
        updatedAt: z.date().or(z.string()),
    })
    .openapi("Post");

const PostInputDto = z
    .object({
        title: z.string().max(255).optional(),
        content: z.string().max(2000).optional(),
        status: z.enum(POST_STATUS).optional(),
    })
    .openapi("CreatePost");

export const CreatePostDto = PostInputDto.required().openapi("CreatePost");

export const UpdatePostDto = z
    .object(CreatePostDto.shape)
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    })
    .openapi("UpdatePost");

export const PostIdParamDto = z.object({ id: z.uuid() }).openapi("PostIdParam");
