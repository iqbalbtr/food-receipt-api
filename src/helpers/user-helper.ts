import db from "@prisma/index";

export async function userExist(params: string | number) {

    const q = await db.users.findFirst({
        where: typeof params === "string" ? { username: params } : { id: params },
        select: {
            id: true,
            username: true,
            profile: true,
            password: true
        }
    })    

    return q
}


export async function userTokenExist(token: string) {

    return db.tokens.findFirst({
        where: {
            token: token
        }
    })
}