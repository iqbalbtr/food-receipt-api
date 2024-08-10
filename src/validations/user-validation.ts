import { zValidator } from "@hono/zod-validator";
import { z } from "zod"
import { zodValidationError } from "../error";

export const registerValidation = zValidator(
    "json",
    z.object({
        name: z.string().min(3).max(55).trim(),
        username: z.string().min(8).max(12).regex(/^[a-z0-9]+$/, "Letters are not allowed").trim(),
        password: z.string().min(6).max(55).trim()
    }),
    // zodValidationError
)

export const updateUserValidation = zValidator(
    "json",
    z.object({
        name: z.string().min(1).max(55).trim(),
        bio: z.string().max(255).trim().optional(),
        profile: z.any().optional()
    }),
    async (result, c) => {
        if(!result.success){
            console.log(result.error);
        }
    }
)

export const chnagePasswordValidation = zValidator("json", z.object({
    latest: z.string().min(8).max(55).trim(),
    pass: z.string().min(8).max(55).trim()
}))

export const loginValidation = zValidator(
    "json",
    z.object({
        username: z.string().min(8).max(12).trim().toLowerCase(),
        password: z.string().min(6).max(55).trim()
    }),
    zodValidationError
)