import { zValidator } from "@hono/zod-validator";
import { z } from "zod"


export const createReceiptValidation = zValidator(
    "json",
    z.object({
        title: z.string().min(3).max(255).trim(),
        sub_title: z.string().min(1).max(255).trim().optional(),
        description: z.string().min(1).trim(),
        ingredients: z.string().min(1).trim(),
        contents: z.string().min(1).trim(),
        tags: z.string().trim().optional()
    })
)

export const updateReceiptValidation = zValidator(
    "json",
    z.object({
        title: z.string().min(3).max(255).trim(),
        sub_title: z.string().min(1).max(255).optional(),
        description: z.string().min(1).trim(),
        tags: z.string().trim().optional(),
        ingredients: z.string().min(1).trim(),
        contents: z.string().min(1).trim().min(1)
    }),
    async (result, c) => {
        if(!result.success){
            const err = result.error.issues
            return c.json({
                message: `${err[0].path[0]} is ${err[0].message}`
            }, 400)
        }
    }
)
