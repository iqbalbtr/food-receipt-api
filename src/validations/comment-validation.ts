import { zValidator } from "@hono/zod-validator";
import { z } from "zod"

export const createCommentValidation = zValidator("form", z.object({
    message: z.string().trim().min(1)
}))