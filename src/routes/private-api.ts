import { Hono } from "hono";
import userHandler from "@handlers/user-handler";
import receiptHandler from "@handlers/receipt-handler";
import { bearerAuth } from "hono/bearer-auth"
import {jwt} from "hono/jwt"
import { userTokenExist } from "@helpers/user-helper";
import commentHandler from "@handlers/comment-handler";

const privateApi = new Hono();

privateApi.use(
    jwt({
        secret: process.env.PRIVATE_KEY!,
    }),
    bearerAuth({
        async verifyToken(token, c) {
            return await userTokenExist(token) ? true : false
        },
    })
);

privateApi.route("/user", userHandler)
privateApi.route("/receipt", receiptHandler)
privateApi.route("/receipt", commentHandler)

export default privateApi