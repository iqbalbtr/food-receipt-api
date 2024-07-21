import { zValidator } from "@hono/zod-validator";
import { z } from "zod"


export const createReceiptValidation = zValidator(
    "form",
    z.object({
        title: z.string().min(3).max(255).trim(),
        sub_title: z.string().min(8).max(255).trim(),
        content: z.string().trim()
    })
)

export const updateReceiptValidation = zValidator(
    "form",
    z.object({
        title: z.string().min(3).max(255).trim(),
        sub_title: z.string().min(8).max(255).optional(),
        content: z.string().trim().optional()
    })
)
