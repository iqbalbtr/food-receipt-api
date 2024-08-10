import { HTTPException } from "hono/http-exception";
import db from "@prisma/index";
import { receiptExist } from "@helpers/receipt-helper";
import { createReceiptType } from "@models/receipt-model";
import { ListType, QueryType } from "@models/query-model";
import { userExist } from "@helpers/user-helper";

export const getRecipeById = async (recipeId: number, userId: number) => {
    const exist = await db.receipt.count({
        where: {
            id: recipeId
        }
    })

    if (exist < 1)
        throw new HTTPException(404, { message: "Recipe is not found" });

    const query = await db.receipt.findFirst({
        where: {
            id: recipeId
        },
        select: {
            id: true,
            title: true,
            sub_title: true,
            content: true,
            ingredients: true,
            create_at: true,
            tags: true,
            description: true,
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
            },
            creator: {
                select: {
                    id: true,
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
                    user_id: true
                }
            }
        }
    })

    const relate = await db.receipt.findMany({
        orderBy: {
            _relevance: {
                fields: ["title", "tags"],
                search: query?.title!,
                sort: "asc"
            }
        },
        where: {
            NOT: {
                id: query?.id!
            }
        },
        take: 5,
        include: {
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
            },
            creator: {
                select: {
                    id: true,
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
                    user_id: true
                }
            }
        }
    })

    const likeStatus = await db.receipt_liked.count({
        where: {
            user_id: userId,
            receipt_id: recipeId
        }
    })

    const bookmark = await db.bookmarks.count({
        where: {
            user_id: userId,
            receipt_id: recipeId
        }
    })

    return {
        id: query?.id,
        title: query?.title,
        sub_title: query?.sub_title,
        receipt_liked: {
            count: query?.receipt_liked.length,
            status: likeStatus >= 1 ? true : false
        },
        bookmark: bookmark >= 1 ? true : false,
        content: JSON.parse(atob(query?.content!)),
        ingredients: JSON.parse(atob(query?.ingredients!)),
        tags: query?.tags,
        description: query?.description,
        create_at: query?.create_at,
        creator: {
            id: query?.creator.id,
            username: query?.creator.username,
            name: query?.creator.profile?.name
        },
        relate: relate.map(fo => ({
            id: fo.id,
            title: fo.title,
            sub_title: fo.sub_title,
            create_at: fo.create_at,
            receipt_liked: fo.receipt_liked.length,
            tags: fo.tags,
            creator: {
                username: fo.creator.username,
                name: fo.creator.profile?.name
            }
        }))
    }
}

export const createReceipt = async (req: createReceiptType, userId: number) => {

    return db.receipt.create({
        data: {
            title: req.title,
            sub_title: req.sub_title,
            description: req.description,
            user_id: userId,
            content: btoa(req.contents),
            ingredients: btoa(req.ingredients),
            tags: req.tags
        },
        select: {
            id: true,
            title: true,
            sub_title: true,
            content: true
        }
    });
}

export const deleteReceipt = async (recipeId: number) => {
    const isReceipt = await receiptExist(recipeId);

    if (!isReceipt)
        throw new HTTPException(400, { message: "Receipt is not found" })

    return db.$transaction(async (tx) => {

        await tx.receipt_liked.deleteMany({
            where: {
                receipt_id: recipeId
            }
        })

        return tx.receipt.delete({
            where: {
                id: recipeId
            }
        })
    })
}


export const updateReceipt = async (req: createReceiptType, recipeId: number) => {

    const isReceipt = await receiptExist(recipeId);

    if (!isReceipt)
        throw new HTTPException(404, { message: "Receipt is not found" })

    console.log(req);


    return db.receipt.update({
        where: {
            id: recipeId
        },
        data: {
            title: req.title,
            tags: req.tags,
            sub_title: req.sub_title,
            description: req.description,
            content: btoa(req.contents),
            ingredients: btoa(req.ingredients)
        },
        select: {
            id: true,
            title: true,
            sub_title: true,
            content: true,
            tags: true,
            ingredients: true
        }
    });
}

export const listReceipt = async (req: QueryType): Promise<ListType<any[]>> => {

    const count = await db.receipt.count({
        where: {
            ...(req.user && {
                creator: {
                    username: req.user
                }
            }),
            ...(req.q && {
                title: {
                    contains: req.q
                }
            }),
        },
    });

    const page = req.page || 1;
    const take = req.take || 5;
    const skip = (page - 1) * take;
    const pageCount = Math.ceil(count / take);


    const list = await db.receipt.findMany({
        where: {
            ...(req.user && {
                creator: {
                    username: req.user
                }
            }),
            ...(req.q && {
                OR: [
                    {
                        title: {
                            search: req.q
                        }
                    },
                    {
                        tags: {
                            search: req.q
                        }
                    }
                ]
            }),
        },
        include: {
            creator: {
                select: {
                    id: true,
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
            }
        },
        skip: skip,
        take: take,
        orderBy: {
            ...(req.order === "popular" ? {
                receipt_liked: {
                    _count: "desc"
                }
            } : {
                create_at: "desc"
            }),
        }
    })


    return {
        page,
        take,
        pageCount,
        itemCount: count,
        list: list.map(fo => ({
            id: fo.id,
            title: fo.title,
            sub_title: fo.sub_title,
            create_at: fo.create_at,
            receipt_liked: fo.receipt_liked.length,
            tags: fo.tags,
            creator: {
                id: fo.creator.id,
                username: fo.creator.username,
                name: fo.creator.profile?.name
            }
        }))
    }
}

export const handleLike = async (recipeId: number, userId: number) => {

    const isUser = await userExist(userId);

    if (!isUser)
        throw new HTTPException(404, { message: "User is not found" });

    const isReceipt = await receiptExist(recipeId);

    if (!isReceipt)
        throw new HTTPException(404, { message: "Receipt is not found" });

    const exist = await db.receipt_liked.count({
        where: {
            receipt_id: recipeId,
            user_id: userId
        }
    })

    exist ? await db.receipt_liked.delete({
        where: {
            receipt_id_user_id: {
                receipt_id: recipeId,
                user_id: userId
            }
        }
    }) : await db.receipt_liked.create({
        data: {
            receipt_id: recipeId,
            user_id: userId,
        }
    })

    return exist ? "unliked" : "liked"
}