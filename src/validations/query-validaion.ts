import { zValidator } from "@hono/zod-validator"
import {z} from "zod"

export const queryValidation = zValidator("query", z.object({
    page: z.coerce.number().optional(),
    take: z.coerce.number().optional(),
    order: z.enum(["date"]).optional()
}))