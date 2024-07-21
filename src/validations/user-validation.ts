import { zValidator } from "@hono/zod-validator";
import { z } from "zod"

export const registerValidation = zValidator(
    "form",
    z.object({
        name: z.string().min(3).max(55).trim(),
        username: z.string().min(8).max(12).trim(),
        password: z.string().min(6).max(55).trim()
    })
)

export const updateUserValidation = zValidator(
    "form",
    z.object({
        name: z.string().min(3).max(55).trim()
    })
)

export const chnagePasswordValidation = zValidator("form", z.object({
    latest: z.string().min(8).max(55).trim(),
    pass: z.string().min(8).max(55).trim()
}))

export const loginValidation = zValidator(
    "form",
    z.object({
        username: z.string().min(8).max(12).trim(),
        password: z.string().min(6).max(55).trim()
    })
)