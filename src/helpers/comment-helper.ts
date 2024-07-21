import db from "@prisma/index"

export const commentExist = async (id: number) => {
    return db.comment.findFirst({
        where: {
            id: id
        }
    })
}

export async function deleteCommentRecursively(commentId: number) {
    const commentsToDelete = await db.comment_reply.findMany({
        where: {
            comment_id: commentId
        },
        select: {
            reply_id: true
        }
    });

    await db.comment_like.deleteMany({
        where: {
            comment_id: commentId
        }
    })

    if (commentsToDelete.length === 0) {
        return db.comment.delete({
            where: {
                id: commentId
            }
        });
    }

    for (const co of commentsToDelete) {
        await db.comment_reply.delete({
            where: {
                comment_id_reply_id: {
                    comment_id: commentId,
                    reply_id: co.reply_id
                }
            }
        });

        await deleteCommentRecursively(co.reply_id);
    }

    return db.comment.delete({
        where: {
            id: commentId
        }
    });
}