import db from "@prisma/index";
import { userExist } from "@helpers/user-helper";
import { LoginType, RegisterType } from "@models/user-model";
import { HTTPException } from "hono/http-exception";
import { password } from "bun";
import { sign } from "jsonwebtoken"

export const loginUser = async (req: LoginType) => {

    const isUser = await userExist(req.username);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" })

    const verify = await password.verify(req.password, isUser.password);

    if (!verify)
        throw new HTTPException(401, { message: "Password is wrong" });

    const payloadToken = {
        id: isUser.id,
        username: isUser.username,
        name: isUser.profile?.name!
    }

    const token = sign(
        payloadToken,
        process.env.PRIVATE_KEY!,
        {
            algorithm: "HS256"
        }
    )

    return db.tokens.update({
        where: {
            user_id: isUser.id
        },
        data: {
            token: token,
            loged_at: new Date()
        },
        select: {
            loged_at: true,
            token: true,
            user: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    })
}

export const registerUser = async (req: RegisterType) => {

    const isUser = await userExist(req.username);

    if (isUser)
        throw new HTTPException(400, { message: "User already exists" })

    const pass = await password.hash(req.password, "bcrypt");

    return db.users.create({
        data: {
            username: req.username,
            password: pass,
            profile: {
                create: {
                    name: req.name
                }
            },
            token: {
                create: {}
            }
        },
        select: {
            username: true,
            profile: {
                select: {
                    name: true
                }
            }
        }
    })
}