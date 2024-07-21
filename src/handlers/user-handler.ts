import { Hono } from "hono";
import { getUserByid, updateUser, changePassword } from "@services/user-service";
import { chnagePasswordValidation, updateUserValidation } from "@validations/user-validation";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod"

const userHandler = new Hono();

userHandler.get("/me", async c => {
    const user = c.get("jwtPayload");
    const result = await getUserByid(user.id);
    return c.json(result);
})

userHandler.patch("/:userId",
    updateUserValidation,
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    async c => {
        const req = c.req.valid("form");
        const { userId } = c.req.valid("param");
        const result = await updateUser(req, userId)
        return c.json(result)
    })


userHandler.patch("/:userId/change-password",
    chnagePasswordValidation,
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    async c => {
        const req = c.req.valid("form");
        const { userId } = c.req.valid("param");
        await changePassword(req, userId)
        return c.json({message: "success"})
    })

userHandler.get("/:userId",
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    async c => {
        const { userId } = c.req.valid("param")
        const result = await getUserByid(userId);
        return c.json(result);
    })

export default userHandler