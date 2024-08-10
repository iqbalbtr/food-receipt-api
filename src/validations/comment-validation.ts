import { zValidator } from "@hono/zod-validator";
import { z } from "zod"
import { zodValidationError } from "../error";

export const createCommentValidation = zValidator(
    "json",
    z.object({
        message: z.string().trim().min(1)
    }),
    zodValidationError
)