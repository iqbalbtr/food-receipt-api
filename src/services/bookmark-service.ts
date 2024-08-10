import { QueryType } from "@models/query-model"
import db from "@prisma/index"

export const handleBookmark = async (receiptId: number, userId: number) => {

    const exist = await db.bookmarks.count({
        where: {
            receipt_id: receiptId,
            user_id: userId
        }
    })

    if (exist) {
        await db.bookmarks.delete({
            where: {
                user_id_receipt_id: {
                    receipt_id: receiptId,
                    user_id: userId
                }
            }
        })
        return "deleted"
    } else {
        await db.bookmarks.create({
            data: {
                receipt_id: receiptId,
                user_id: userId
            }
        })
        return "created"
    }
}

export async function getUserBookmark(userId: number, req: QueryType) {
    const count = await db.bookmarks.count({
        where: {
            user_id: userId
        },
    });

    const page = req.page || 1;
    const take = req.take || 5;
    const skip = (page - 1) * take;
    const pageCount = Math.ceil(count / take);
    


    const list = await db.bookmarks.findMany({
        where: {
            user_id: userId,
            ...(req.q && {
                receipts: {
                    title: {
                        search: req.q
                    },
                    tags: {
                        search: req.q
                    } 
                }
            })
        },
        include: {
            receipts: {
                include: {
                    creator: {
                        select: {
                            username: true,
                            profile: {
                                select: {
                                    name: true
                                }
                            },
                            id: true
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
                    }
                }
            }
        },
        skip: skip,
        take: take,
        orderBy: {
            // Bookmarks date
        }
    })


    return {
        page,
        take,
        pageCount,
        itemCount: count,
        list: list.map(fo => ({
            id: fo.receipts.id,
            title: fo.receipts.title,
            sub_title: fo.receipts.sub_title,
            create_at: fo.receipts.create_at,
            receipt_liked: fo.receipts.receipt_liked.length,
            tags: fo.receipts.tags,
            creator: {
                username: fo.receipts.creator.username,
                name: fo.receipts.creator.profile?.name,
                id: fo.receipts.creator.id
            }
        }))
    }
}