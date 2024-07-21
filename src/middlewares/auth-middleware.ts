import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception"

export default createMiddleware(async (c, next) => {

    await next();
})
