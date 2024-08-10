import { Hono } from "hono";
import { getUserByid, updateUser, changePassword, updatePhotoProfile } from "@services/user-service";
import { chnagePasswordValidation, updateUserValidation } from "@validations/user-validation";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod"
import { getUserBookmark } from "@services/bookmark-service";
import { queryValidation } from "@validations/query-validaion";
import { HTTPException } from "hono/http-exception";

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
        const req = c.req.valid("json");
        const { userId } = c.req.valid("param");
        const result = await updateUser(req, userId)
        return c.json(result)
    })

userHandler.patch("/:userId/profile",
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    async c => {
        const body = await c.req.parseBody();
        const user = c.get("jwtPayload");
        if(body.profile instanceof Blob){
            const profile = body.profile;
            if(profile.size >= 2.5 * 1024 * 1024){
                throw new HTTPException(400, {message: "File to large"})
            }
            await Bun.write(`./public/profile/user_${user.id}.jpeg`, body.profile)
            await updatePhotoProfile(user.id)
        }        
        return c.json({
            message: `${process.env.BASE_URL}/public/profile/user_${user.id}.jpeg`
        })
    })


userHandler.patch("/:userId/change-password",
    chnagePasswordValidation,
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    async c => {
        const req = c.req.valid("json");
        const { userId } = c.req.valid("param");
        await changePassword(req, userId)
        return c.json({ message: "success" })
    })

userHandler.get("/:userId",
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    async c => {
        const { userId } = c.req.valid("param")
        const result = await getUserByid(userId);
        return c.json(result);
    })

userHandler.get("/:userId/bookmarks",
    zValidator("param", z.object({ userId: z.coerce.number().min(1) })),
    queryValidation,
    async c => {
        const { userId } = c.req.valid("param")
        const req = c.req.valid("query")
        const result = await getUserBookmark(userId, req);
        return c.json(result);
    })

export default userHandler