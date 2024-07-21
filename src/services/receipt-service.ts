import { HTTPException } from "hono/http-exception";
import db from "@prisma/index";
import { receiptExist } from "@helpers/receipt-helper";
import { createReceiptType, ReceiptType, updateReceiptType } from "@models/receipt-model";
import { ListType, QueryType } from "@models/query-model";
import { userExist } from "@helpers/user-helper";


export const createReceipt = async (req: createReceiptType, userId: number) => {
    return db.receipt.create({
        data: {
            content: req.content,
            title: req.title,
            sub_title: req.sub_title,
            user_id: userId,
        },
        select: {
            id: true,
            title: true,
            sub_title: true,
            content: true
        }
    });
}

export const deleteReceipt = async (receiptId: number) => {
    const isReceipt = await receiptExist(receiptId);

    if (!isReceipt)
        throw new HTTPException(400, { message: "Receipt is not found" })

    return db.$transaction(async (tx) => {

        await tx.receipt_liked.deleteMany({
            where: {
                receipt_id: receiptId
            }
        })

        return tx.receipt.delete({
            where: {
                id: receiptId
            }
        })
    })
}


export const updateReceipt = async (req: updateReceiptType, receiptId: number) => {

    const isReceipt = await receiptExist(receiptId);

    if (!isReceipt)
        throw new HTTPException(404, { message: "Receipt is not found" })

    return db.receipt.update({
        where: {
            id: receiptId
        },
        data: req,
        select: {
            id: true,
            title: true,
            sub_title: true,
            content: true
        }
    });
}

export const listReceipt = async (req: QueryType): Promise<ListType<any[]>> => {

    const count = await db.receipt.count();

    const page = req.page || 1;
    const take = req.take || 5;
    const skip = (page - 1) * take;
    const pageCount = Math.ceil(count / take);

    const list = await db.receipt.findMany({
        select: {
            id: true,
            title: true,
            sub_title: true,
            content: true,
            creator: {
                select: {
                    username: true,
                    profile: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            receipt_liked: {
                select: {
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            },
            comments: {
                where: {
                    reply_status: false,
                },
                select: {
                    id: true,
                    message: true,
                    create_at: true,
                    user: {
                        select: {
                            username: true
                        }
                    },
                    like: true,
                    reply: {
                        include: {
                            reply: true
                        }
                    }
                }
            }
        },
        skip: skip,
        take: take
    })

    return {
        page,
        take,
        pageCount,
        list: list.map(fo => ({
            id: fo.id,
            title: fo.title,
            sub_title: fo.sub_title,
            receipt_liked: fo.receipt_liked.length,
            content: fo.content,
            creator: {
                username: fo.creator.username,
                name: fo.creator.profile?.name
            },
            comment: {
                link: `${process.env.BASE_URL}/api/receipt/${fo.id}`,
                count: fo.comments.length
            }
        }))
    }
}

export const handleLike = async (receiptId: number, userId: number) => {

    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    const isReceipt = await receiptExist(receiptId);

    if (!isReceipt)
        throw new HTTPException(404, { message: "Receipt is not found" });

    const exist = await db.receipt_liked.count({
        where: {
            receipt_id: receiptId,
            user_id: userId
        }
    })

    exist ? await db.receipt_liked.delete({
        where: {
            receipt_id_user_id: {
                receipt_id: receiptId,
                user_id: userId
            }
        }
    }) : await db.receipt_liked.create({
        data: {
            receipt_id: receiptId,
            user_id: userId,
            assigned_by: isUser.profile?.name!
        }
    })

    return exist ? "unliked" : "liked"
}