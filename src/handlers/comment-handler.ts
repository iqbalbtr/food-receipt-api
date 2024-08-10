import { zValidator } from "@hono/zod-validator";
import { createComment, deleteComment, getComment, getReplyComment, likeComment, replyComment, updateComment } from "@services/comment-service";
import { createCommentValidation } from "@validations/comment-validation";
import { z } from "zod"
import { Hono } from "hono";
import { commentQueryValidation } from "@validations/query-validaion";

const commentHandler = new Hono().basePath("/:receiptId/comment");

commentHandler.post("/",
    zValidator("param", z.object({ receiptId: z.coerce.number().min(1) })),
    createCommentValidation,
    async c => {
        const user = c.get("jwtPayload");
        const { receiptId } = c.req.valid("param")
        const req = c.req.valid("json");
        const result = await createComment(req, receiptId, user.id)
        return c.json(result)
    })

commentHandler.get("/",
    zValidator("param", z.object({ receiptId: z.coerce.number().min(1) })),
    commentQueryValidation,
    async c => {
        const { receiptId } = c.req.valid("param")
        const req = c.req.valid("query")
        const user = c.get("jwtPayload");
        const result = await getComment(receiptId, req, user.id);
        return c.json(result)
    })

commentHandler.get("/:commentId",
    zValidator("param", z.object({ receiptId: z.coerce.number().min(1), commentId: z.coerce.number().min(1) })),
    commentQueryValidation,
    async c => {
        const { commentId, receiptId } = c.req.valid("param");
        const req = c.req.valid("query");
        const user = c.get("jwtPayload");
        const result = await getReplyComment(commentId, receiptId, req, user.id);
        return c.json(result)
    })

commentHandler.post("/:commentId",
    zValidator("param", z.object({ receiptId: z.coerce.number(), commentId: z.coerce.number() })),
    createCommentValidation,
    async c => {
        const req = c.req.valid("json")
        const { receiptId, commentId } = c.req.valid("param")
        const user = c.get("jwtPayload");
        const result = await replyComment(req, commentId, receiptId, user.id)
        return c.json(result)
    })

commentHandler.patch("/:commentId",
    zValidator("param", z.object({ commentId: z.coerce.number().min(1) })),
    createCommentValidation,
    async c => {
        const req = c.req.valid("json");
        const { commentId } = c.req.valid("param");
        const result = await updateComment(req, commentId);
        return c.json(result)
    })

commentHandler.delete("/:commentId",
    zValidator("param", z.object({ commentId: z.coerce.number().min(1) })),
    async c => {
        const { commentId } = c.req.valid("param")
        await deleteComment(commentId);
        return c.json({message: "success"})
    })

commentHandler.post("/:commentId/like",
    zValidator("param", z.object({ commentId: z.coerce.number().min(1) })),
    async c => {
        const { commentId } = c.req.valid("param")
        const user = c.get("jwtPayload")
        const result = await likeComment(commentId, user.id);
        return c.json({message: result})
    })

export default commentHandler