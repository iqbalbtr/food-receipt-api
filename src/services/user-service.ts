import { userExist } from "@helpers/user-helper"
import db from "@prisma/index";
import { HTTPException } from "hono/http-exception";
import { password } from "bun";

export const getUserByid = async (userId: number) => {
    
    const isUser = await userExist(userId);

    const post = await db.receipt.findMany({
        where: {
            creator: {
                id: isUser?.id
            }
        },
        select: {
            receipt_liked: true
        }
    })
    
    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    return {
        id: isUser.id,
        username: isUser.username,
        name: isUser.profile?.name,
        bio: isUser.profile?.bio,
        info: {
            post: post.length,
            likes: post.reduce((sum, acc) => sum += acc.receipt_liked.length, 0)
        }
    }
}

export const updateUser = async (req: { name: string, bio?: string }, userId: number) => {
    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    return db.profile.update({
        where: {
            user_id: userId
        },
        data: {
            name: req.name,
            bio: req.bio
        }
    })
}

export const changePassword = async (req: { latest: string, pass: string }, userId: number) => {

    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    const verify = await password.verify(req.latest, isUser.password);

    if (!verify)
        throw new HTTPException(401, { message: "Password is wrong" })

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

export const updatePhotoProfile = async(userId: number) => {
    
    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });
    
    return db.profile.update({
        where: {
            user_id: userId
        },
        data: {
            profile: `${process.env.BASE_URL}/public/profile/user_${userId}.jpeg`
        }
    })
}