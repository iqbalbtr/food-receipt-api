import db from "@prisma/index"

export const receiptExist = async(receiptId: number) => {
    return db.receipt.findUnique({
        where: {
            id: receiptId
        }
    })
}