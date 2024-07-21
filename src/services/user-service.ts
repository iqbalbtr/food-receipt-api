import { userExist } from "@helpers/user-helper"
import db from "@prisma/index";
import { HTTPException } from "hono/http-exception";
import { password } from "bun";

export const getUserByid = async (userId: number) => {
    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    return {
        id: isUser.id,
        username: isUser.username,
        name: isUser.profile?.name
    }
}

export const updateUser = async (req: { name: string }, userId: number) => {
    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    return db.profile.update({
        where: {
            user_id: userId
        },
        data: {
            name: req.name
        }
    })
}

export const changePassword = async (req: { latest: string, pass: string }, userId: number) => {
    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    const verify = password.verify(req.latest, isUser.password);

    if (!verify)
        throw new HTTPException(400, { message: "Password is wrong" })

    const hash = await password.hash(req.pass, { algorithm: "bcrypt" });

    return db.users.update({
        where: {
            id: userId
        },
        data: {
            password: hash
        }
    })
}