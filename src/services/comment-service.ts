import { commentExist, deleteCommentRecursively } from "@helpers/comment-helper"
import db from "@prisma/index"
import { HTTPException } from "hono/http-exception"

export const createComment = async (req: any, receiptId: number, userId: number) => {

    return db.comment.create({
        data: {
            message: req.message,
            receipt_id: receiptId,
            user_id: userId
        }
    })
}

export const replyComment = async (req: any, commentId: number, receiptId: number, userId: number) => {

    const isExist = commentExist(commentId)

    if (!isExist)
        throw new HTTPException(404, { message: "Comment is not found" });

    const result = await db.$transaction(async (tx) => {
        const reply = await tx.comment.create({
            data: {
                message: req.message,
                receipt_id: receiptId,
                user_id: userId,
                reply_status: true
            }
        })

        await tx.comment_reply.create({
            data: {
                comment_id: commentId,
                reply_id: reply.id
            },
        })


        return reply
    })

    return result
}

export const updateComment = async (req: any, commentId: number) => {

    const isExist = await commentExist(commentId);

    if (!isExist)
        throw new HTTPException(404, { message: "Comment is not found" });

    return db.comment.update({
        where: {
            id: commentId
        },
        data: {
            message: req.message
        }
    })
}

export const handleCommentLike = async (commenId: number, userId: number) => {
    const isExist = await db.comment_like.findFirst({
        where: {
            comment_id: commenId,
            user_id: userId
        }
    })

    return isExist ? db.comment_like.delete({
        where: {
            comment_id_user_id: {
                comment_id: commenId,
                user_id: userId
            }
        }
    }) : db.comment_like.create({
        data: {
            comment_id: commenId,
            user_id: userId
        }
    })
}

export const deleteComment = async (commentId: number) => {
    const isExist = await commentExist(commentId)

    if (!isExist)
        throw new HTTPException(404, { message: "Comment is not found" });

    return deleteCommentRecursively(commentId)
}

export const getComment = async (receiptId: number) => {
    const result = await db.comment.findMany({
        where: {
            receipt_id: receiptId,
            reply_status: false
        },
        select: {
            id: true,
            message: true,
            user: {
                select: {
                    username: true
                }
            },
            create_at: true,
            reply_status: true,
            like: true,
            reply: {
                select: {
                    comment_id: true
                }
            }
        }
    })

    if (result.length === 0)
        throw new HTTPException(404, { message: "Comment is not found" })


    return result.map(fo => ({
        id: fo.id,
        message: fo.message,
        user: fo.user.username,
        create_at: fo.create_at,
        like_count: fo.like.length,
        reply: {
            link: `${process.env.BASE_URL}/api/receipt/${receiptId}/comment/${fo.id}`,
            count: fo.reply.length
        }
    }))
}

export const getReplyComment = async (commentId: number, receiptId: number) => {
    const result = await db.comment_reply.findMany({
        where: {
            comment_id: commentId
        },
        select: {
            reply: {
                select: {
                    id: true,
                    message: true,
                    user: {
                        select: {
                            username: true
                        }
                    },
                    create_at: true,
                    reply_status: true,
                    like: true,
                    reply: {
                        select: {
                            comment_id: true
                        }
                    }
                }
            }
        }
    })

    if (result.length === 0)
        throw new HTTPException(404, { message: "Comment is not found" })

    return {
        comment_id: commentId,
        comment: result.map(fo => ({
            id: fo.reply.id,
            message: fo.reply.message,
            user: fo.reply.user.username,
            create_at: fo.reply.create_at,
            like_count: fo.reply.like.length,
            reply: {
                link: `${process.env.BASE_URL}/api/receipt/${receiptId}/comment/${fo.reply.id}`,
                count: fo.reply.reply.length
            }
        }))
    }
}

export const likeComment = async(commentId: number, userId: number) => {
    const isLike = await db.comment_like.findFirst({
        where: {
            comment_id: commentId,
            user_id: userId
        }
    })

    isLike ? await db.comment_like.delete({
        where: {
            comment_id_user_id: {
                comment_id: commentId,
                user_id: userId
            }
        }
    }) : await db.comment_like.create({
        data: {
            comment_id: commentId,
            user_id: userId
        }
    })

    return isLike ? "unliked" : "liked"
}