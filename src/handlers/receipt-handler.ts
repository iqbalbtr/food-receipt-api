import { zValidator } from "@hono/zod-validator";
import { handleBookmark } from "@services/bookmark-service";
import { createReceipt, deleteReceipt, getRecipeById, handleLike, listReceipt, updateReceipt } from "@services/receipt-service";
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

receiptHandler.get("/:recipeId",
    zValidator("param", z.object({ recipeId: z.coerce.number().min(1) })),
    async c => {
        const {recipeId} = c.req.valid("param");
        const user = c.get("jwtPayload")
        const result = await getRecipeById(recipeId, user.id);
        return c.json(result)
    })

receiptHandler.post("/",
    createReceiptValidation,
    async c => {
        const req = c.req.valid("json");        
        const userId = c.get("jwtPayload");
        const result = await createReceipt(req, userId.id)
        return c.json(result)
    })

receiptHandler.delete("/:recipeId",
    zValidator("param", z.object({ recipeId: z.coerce.number().min(1) })),
    async c => {
        const { recipeId } = c.req.valid("param")
        await deleteReceipt(recipeId);
        return c.json({ result: { message: "success" } })
    })

receiptHandler.patch("/:recipeId",
    zValidator("param", z.object({ recipeId: z.coerce.number().min(1) })),
    updateReceiptValidation,
    async c => {
        const req = c.req.valid("json");
        const { recipeId } = c.req.valid("param");
        const result = await updateReceipt(req, recipeId)
        return c.json(result)
    })


receiptHandler.post("/:recipeId/like",
    zValidator("param", z.object({ recipeId: z.coerce.number().min(1) })),
    async c => {
        const { recipeId } = c.req.valid("param");
        const user = c.get("jwtPayload");
        const result = await handleLike(recipeId, user.id)
        return c.json({ message: result })
    });


receiptHandler.post("/:recipeId/bookmark",
    zValidator("param", z.object({ recipeId: z.coerce.number().min(1) })),
    async c => {
        const { recipeId } = c.req.valid("param");
        const user = c.get("jwtPayload");
        const result = await handleBookmark(recipeId, user.id);
        return c.json({ message: result })
    })

export default receiptHandler