import { commentExist, deleteCommentRecursively } from "@helpers/comment-helper"
import { CommentQueryType } from "@models/query-model"
import db from "@prisma/index"
import { HTTPException } from "hono/http-exception"

export const createComment = async (req: any, receiptId: number, userId: number) => {

    const result = await db.comment.create({
        data: {
            message: req.message,
            receipt_id: receiptId,
            user_id: userId
        },
        include: {
            user: true
        }
    })

    return {
        id: result.id,
        message: result.message,
        user: {
            username: result.user.username,
            id: result.user.id
        },
        create_at: result.create_at,
        like: {
            count: 0,
            status: false
        },
        reply: {
            link: `${process.env.BASE_URL}/api/receipt/8/comment/6`,
            count: 0
        }
    }
}

export const replyComment = async (req: any, commentId: number, receiptId: number, userId: number) => {

    const isExist = await commentExist(commentId)

    if (!isExist)
        throw new HTTPException(404, { message: "Comment is not found" });

    const result = await db.$transaction(async (tx) => {
        const reply = await tx.comment.create({
            data: {
                message: req.message,
                receipt_id: receiptId,
                user_id: userId,
                reply_status: true
            },
            include: {
                user: true
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

    return {
        id: result.id,
        message: result.message,
        user: {
            username: result.user.username,
            id: result.user.id,
        },
        create_at: result.create_at,
        like: {
            count: 0,
            status: false
        },
        reply: {
            link: `${process.env.BASE_URL}/api/receipt/8/comment/6`,
            count: 0
        }
    }
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

export const getComment = async (receiptId: number, req: CommentQueryType, userId: number) => {

    const count = await db.comment.count({
        where: {
            receipt_id: receiptId,
            reply_status: false
        }
    });

    const take = req.take ?? 10;
    const page = req.page ?? 1;
    const skip = (page - 1) * take;

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
                    id: true,
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
        },
        skip: skip,
        take: take
    });

    return {
        pageCount: Math.ceil(count / take),
        itemcCount: count,
        page: page,
        take: take,
        list: result.map(fo => ({
            id: fo.id,
            message: fo.message,
            user: {
                id: fo.user.id,
                username: fo.user.username
            },
            create_at: fo.create_at,
            like: {
                count: fo.like.length,
                status: fo.like.find(fo => fo.user_id === userId)
            },
            reply: {
                link: `${process.env.BASE_URL}/api/receipt/${receiptId}/comment/${fo.id}`,
                count: fo.reply.length
            }
        }))
    }
}



export const getReplyComment = async (commentId: number, receiptId: number, req: CommentQueryType, userId: number) => {

    const count = await db.comment_reply.count({
        where: {
            comment_id: commentId
        }
    });

    const take = req.take ?? 10;
    const page = req.page ?? 1;
    const skip = (page - 1) * take;

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
                            id: true,
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
        },
        skip: skip,
        take: take
    });


    return {
        pageCount: Math.ceil(count / take),
        itemCount: count,
        page: page,
        take: take,
        list: result.map(fo => ({
            id: fo.reply.id,
            message: fo.reply.message,
            user: {
                id: fo.reply.user.id,
                username: fo.reply.user.username
            },
            create_at: fo.reply.create_at,
            like: {
                count: fo.reply.like.length,
                status: fo.reply.like.find(fo => fo.user_id === userId)
            },
            reply: {
                link: `${process.env.BASE_URL}/api/receipt/${receiptId}/comment/${fo.reply.id}`,
                count: fo.reply.reply.length
            }
        }))
    }
}

export const likeComment = async (commentId: number, userId: number) => {
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