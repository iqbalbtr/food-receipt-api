import { Hono } from "hono";
import authHandler from "@handlers/auth-handler";

const api = new Hono();

api.get("/", c => c.json({status: true, message: "active"}, 200));
api.route("/auth", authHandler);

export default api