import { logger } from "hono/logger";
import app from "../web/web"
import db from "../../prisma/prisma";

describe("Should to be response success", async () => {
    test("GET /", async () => {
        const res = await app.request("/", {
            method: "GET"
        });
        expect(res.status).toBe(200)
        expect(res.json()).toEqual({ message: "Active", status: true })
    });

    test("POST /auth/register", async () => {

        const form = new FormData();
        form.append("username", "iqbalbtr")
        form.append("password", "25082005")
        form.append("name", "Iqbal Bahtiar")

        const res = app.request("/auth/register", {
            method: "POST",
            body: form
        })

        expect(res.status).toBe(200)
        expect(res.result).toEqual({ username: "iqbalbtr", profile: { name: "Iqbal Bahtiar" } })

        if (res.status === 200) {
            db.users.delete({
                where: {
                    username: "iqbalbtr"
                }
            })
        }
    })
})