import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTPResponseError } from "hono/types";
import { ZodError } from "zod"

export default async (err: Error | HTTPResponseError, c: Context) => {

    console.error(err);
    if (err instanceof HTTPException) {
        return err.getResponse()
    } else if (err instanceof ZodError) {
        return c.text("Err")
    } else {
        // throw new HTTPException(500, {message: "Internal server error"})
        return c.json(err)
    }

}