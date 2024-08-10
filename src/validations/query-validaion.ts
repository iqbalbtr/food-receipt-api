import { zValidator } from "@hono/zod-validator"
import {z} from "zod"

export const queryValidation = zValidator("query", z.object({
    page: z.coerce.number().optional(),
    take: z.coerce.number().optional(),
    order: z.enum(["date", "popular"]).optional(),
    user: z.string().optional(),
    q: z.string().trim().optional()
}))

export const commentQueryValidation = zValidator("query", z.object({
    page: z.coerce.number().optional(),
    take: z.coerce.number().optional()
}))