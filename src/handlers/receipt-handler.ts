import { zValidator } from "@hono/zod-validator";
import { createReceipt, deleteReceipt, handleLike, listReceipt, updateReceipt } from "@services/receipt-service";
import { queryValidation } from "@validations/query-validaion";
import { createReceiptValidation, updateReceiptValidation } from "@validations/receipt-validaiton";
import { Hono } from "hono";
import { z } from "zod"

const receiptHandler = new Hono();

receiptHandler.get("/",
    queryValidation,
    async c => {
        const req = c.req.valid("query");
        const result = await listReceipt(req);
        return c.json(result)
    })

receiptHandler.post("/",
    createReceiptValidation,
    async c => {
        const req = c.req.valid("form");
        const userId = c.get("jwtPayload");
        const result = await createReceipt(req, userId.id)
        return c.json(result)
    })

receiptHandler.delete("/:receiptId",
    zValidator("param", z.object({ receiptId: z.coerce.number().min(1) })),
    async c => {
        const { receiptId } = c.req.valid("param")
        await deleteReceipt(receiptId);
        return c.json({ result: { message: "success" } })
    })

receiptHandler.patch("/:receiptId",
    zValidator("param", z.object({ receiptId: z.coerce.number().min(1) })),
    updateReceiptValidation,
    async c => {
        const req = c.req.valid("form");
        const { receiptId } = c.req.valid("param");
        const result = await updateReceipt(req, receiptId)
        return c.json(result)
    })

    
receiptHandler.post("/:receiptId/like",
        zValidator("param", z.object({ receiptId: z.coerce.number().min(1) })),
        async c => {
            const { receiptId } = c.req.valid("param");
            const user = c.get("jwtPayload");
            const result = await handleLike(receiptId, user.id)
            return c.json(result)
        });

export default receiptHandler